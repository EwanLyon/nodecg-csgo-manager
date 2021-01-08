import * as nodecgApiContext from './util/nodecg-api-context';
import * as SteamAPI from './util/steam-api';
import _ from 'lodash';

import { CSGOOutputAllplayer, CSGOOutputPhaseCountdowns, Map } from '../types/csgo-gsi';
import { PlayerDataAll, TeamData } from '../types/extra-data';
import { MapInfo, MatchScores } from '../types/match-scores';
import { ExtraData as DummyExtraData } from './dummyData';
import { TeamsPreset } from '../types/team-preset';

const nodecg = nodecgApiContext.get();

const allPlayersRep = nodecg.Replicant<CSGOOutputAllplayer[]>('allPlayers');
const phaseRep = nodecg.Replicant<CSGOOutputPhaseCountdowns>('phase');
const matchRep = nodecg.Replicant<Map>('matchStats');
const playerDataRep = nodecg.Replicant<PlayerDataAll>('playerData', {
	defaultValue: DummyExtraData,
	persistent: false
});
const teamOneRep = nodecg.Replicant<TeamData>('teamOne');
const teamTwoRep = nodecg.Replicant<TeamData>('teamTwo');
const teamPresetsRep = nodecg.Replicant<TeamsPreset>('teamPreset');
const currentMatchRep = nodecg.Replicant<string>('currentMatch');
const matchScoresRep = nodecg.Replicant<MatchScores>('matchScores');

teamOneRep.value.players = [];
teamTwoRep.value.players = [];

function getCurrentMatch() {
	return matchScoresRep.value.find(match => match.id === currentMatchRep.value);
}

// Returns true if teamOne should be T's
function currentTeamSide(round: number): boolean {
	if (round < 15) {
		return true;
	}

	if (round >= 30) {
		// Overtime math
		return Boolean(Math.floor((round - 30) / 3) % 2);
	}

	return false;
}

// SETTING TEAMONE AND TEAMTWO PLAYERS
function refreshTeamPlayers(): void {
	const teamOneList: string[] = [];
	const teamTwoList: string[] = [];
	allPlayersRep.value.forEach(player => {
		// Check if player exists in extra player data
		if (playerDataRep.value[player.steamId] === undefined) {
			// If player didn't exists add them
			const presetPlayer = teamPresetsRep.value.players[player.steamId];

			if (presetPlayer) {
				playerDataRep.value[player.steamId] = {
					totalDamage: 0,
					adr: 0,
					country: presetPlayer.country,
					name: presetPlayer.realName,
					image: presetPlayer.profilePicture
				};
			} else {
				playerDataRep.value[player.steamId] = {
					totalDamage: 0,
					adr: 0
				};
			}
		}

		if (currentTeamSide(matchRep.value.round)) {
			if (player.team === 'T') {
				// TeamOne is T in first half
				teamOneList.push(player.steamId);
			} else {
				teamTwoList.push(player.steamId);
			}
		} else if (player.team === 'T') {
			// TeamTwo is CT in first half
			teamTwoList.push(player.steamId);
		} else {
			teamOneList.push(player.steamId);
		}
	});

	teamOneRep.value.players = teamOneList;
	teamTwoRep.value.players = teamTwoList;
}

let changed = false;
allPlayersRep.on('change', newVal => {
	// PLAYER ADR
	// Check if round has finished
	if (!changed && phaseRep.value.phase === 'over') {
		const curRound = matchRep.value.round <= 0 ? 1 : matchRep.value.round; // So we don't divide by 0
		newVal.forEach(player => {
			// Check if player exists
			if (playerDataRep.value[player.steamId] === undefined) {
				// If player didn't exists add them
				playerDataRep.value[player.steamId] = {
					totalDamage: player.state.round_totaldmg,
					adr: player.state.round_totaldmg / curRound
				};
			} else {
				// Add round damage to total damage
				playerDataRep.value[player.steamId].totalDamage += player.state.round_totaldmg;
				playerDataRep.value[player.steamId].adr = playerDataRep.value[player.steamId].totalDamage / curRound;
			}
		});

		changed = true;
	}

	// Refresh player list if not all players are added
	if (teamOneRep.value.players.length < 5) {
		refreshTeamPlayers();
	}

	// Next round has started
	if (phaseRep.value.phase === 'freezetime' && changed) {
		changed = false;

		// Clear all data if round 0
		if (matchRep.value.round === 0) {
			playerDataRep.value = DummyExtraData;
		}
	}

	// TEAM ECONOMY
	const playersOne = newVal.filter(player => {
		if (teamOneRep.value.players.includes(player.steamId)) return player;

		return undefined;
	});

	const playersTwo = newVal.filter(player => {
		if (teamTwoRep.value.players.includes(player.steamId)) return player;

		return undefined;
	});

	// Equipment Value
	let oneEquipTotal = 0;
	playersOne.forEach(player => {
		oneEquipTotal += player.state.equip_value;
	});

	let twoEquipTotal = 0;
	playersTwo.forEach(player => {
		twoEquipTotal += player.state.equip_value;
	});

	// Total Money
	let oneTotalMoney = 0;
	playersOne.forEach(player => {
		oneTotalMoney += player.state.money;
	});

	let twoTotalMoney = 0;
	playersTwo.forEach(player => {
		twoTotalMoney += player.state.money;
	});

	teamOneRep.value.equipmentValue = oneEquipTotal;
	teamOneRep.value.totalMoney = oneTotalMoney;

	teamTwoRep.value.equipmentValue = twoEquipTotal;
	teamTwoRep.value.totalMoney = twoTotalMoney;

	// Team nades
	const teamOneNades = sumGrenades(playersOne);
	const teamTwoNades = sumGrenades(playersTwo);

	teamOneRep.value.grenades = teamOneNades;
	teamTwoRep.value.grenades = teamTwoNades;
});

// Team Names
nodecg.listenFor('updateName', (data: { name: string; teamTwo: boolean }) => {
	if (data.teamTwo) {
		teamTwoRep.value.name = data.name;
	} else {
		teamOneRep.value.name = data.name;
	}
});

let namesSet = false;
// eslint-disable-next-line complexity
matchRep.on('change', (newVal, oldVal) => {
	// Next half
	if (newVal.round === 15 && oldVal?.round === 14) {
		// const tLogo = teamImagesRep.value.find(img => img.name === 'T_Icon')?.url;
		// const ctLogo = teamImagesRep.value.find(img => img.name === 'CT_Icon')?.url;
		const tLogo = '../shared/media/T_Icon.png';
		const ctLogo = '../shared/media/CT_Icon.png';

		if (typeof tLogo === 'undefined' || typeof ctLogo === 'undefined') {
			nodecg.log.error('T and/or CT Icon is missing');
			return;
		}

		// If using T name
		if (teamOneRep.value.name === 'Terrorists') {
			teamOneRep.value.name = 'Counter-Terrorists';
		}

		// If using CT name
		if (teamTwoRep.value.name === 'Counter-Terrorists') {
			teamTwoRep.value.name = 'Terrorists';
		}

		// If using T logo
		if (teamOneRep.value.teamURL === tLogo) {
			teamOneRep.value.teamURL = ctLogo;
		}

		// If using CT logo
		if (teamTwoRep.value.teamURL === ctLogo) {
			teamTwoRep.value.teamURL = tLogo;
		}
	}

	if (!namesSet && matchRep.round >= 0) {
		namesSet = true;
		const defaultTeamOneName = matchRep.round < 15 ? 'Terrorists' : 'Counter-Terrorists';
		teamOneRep.value.name = defaultTeamOneName;

		const defaultTeamTwoName = matchRep.round < 15 ? 'Counter-Terrorists' : 'Terrorists';
		teamTwoRep.value.name = defaultTeamTwoName;
	}
});

// Team Logos
nodecg.listenFor('updateLogo', (data: { url: string; teamTwo: boolean }) => {
	if (data.teamTwo) {
		teamTwoRep.value.teamURL = data.url;
	} else {
		teamOneRep.value.teamURL = data.url;
	}
});

// Player icon
nodecg.listenFor('updatePlayerProfilePicture', (data: { id: string; url: string }) => {
	if (!playerDataRep.value[data.id]) {
		nodecg.log.error('(ProfilePicture) Player id does not exist: ' + data.id);
		return;
	}

	playerDataRep.value[data.id].image = data.url;
});

// Player country
nodecg.listenFor('updatePlayerCountry', (data: { id: string; country: string }) => {
	if (!playerDataRep.value[data.id]) {
		nodecg.log.error('(PlayerCountry) Player id does not exist: ' + data.id);
		return;
	}

	playerDataRep.value[data.id].country = data.country;
});

// Player name
nodecg.listenFor('updatePlayerName', (data: { id: string; name: string }) => {
	if (!playerDataRep.value[data.id]) {
		nodecg.log.error('(PlayerName) Player id does not exist: ' + data.id);
		return;
	}

	playerDataRep.value[data.id].name = data.name;
});

// MAP DATA
nodecg.listenFor('addMap', (data: MapInfo) => {
	const currentMatch = getCurrentMatch();
	if (currentMatch?.maps.find(map => map.map === data.map)) {
		nodecg.log.warn(`${data.map} has already been added`);
		return;
	}

	currentMatch?.maps.push(data);
});

nodecg.listenFor('removeMap', mapName => {
	const currentMatch = getCurrentMatch();
	const mapIndex = currentMatch?.maps.findIndex(map => map.map === mapName) || -1;
	if (mapIndex > -1) {
		currentMatch?.maps.splice(mapIndex, 1);
	}
});

nodecg.listenFor('reorderMaps', newOrder => {
	const currentMatch = getCurrentMatch();
	if (currentMatch) currentMatch.maps = newOrder;
});

// Steam Profile Pictures
nodecg.listenFor('getAllSteamProfilePictures', () => {
	getAllPlayersProfilePictures();
});

nodecg.listenFor('getAllProfileData', () => {
	getAllProfileData();
});

function getAllPlayersProfilePictures(overwrite = false) {
	const playerData = _.cloneDeep(playerDataRep.value);

	const steamIds = Object.keys(playerData);

	SteamAPI.getProfilePictures(steamIds).then(pfps => {
		pfps.forEach((pfp) => {
			// Default question mark PFP
			if (pfp.pfp !== 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg') {
				// Overwrite all player profile pictures else just do ones that dont have one
				if (overwrite) {
					playerData[pfp.id].image = pfp.pfp;
				} else if (!playerData[pfp.id].image) {
					playerData[pfp.id].image = pfp.pfp;
				}
			}
		});
	});

	playerDataRep.value = playerData;
}

function getAllProfileData(overwrite = false) {
	const playerData = _.cloneDeep(playerDataRep.value);

	const steamIds = Object.keys(playerData);

	SteamAPI.getProfileData(steamIds).then(pfps => {
		pfps.forEach((profileData) => {
			// Default question mark PFP
			if (profileData.pfp !== 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg') {
				// Overwrite all player profile pictures else just do ones that dont have one
				if (overwrite) {
					playerData[profileData.steamid].image = profileData.pfp;
				} else if (!playerData[profileData.steamid].image) {
					playerData[profileData.steamid].image = profileData.pfp;
				}
			}

			playerData[profileData.steamid].name = profileData.realname;
			playerData[profileData.steamid].country = Array.from(profileData.country || '').map(letterToLetterEmoji).join('');
		});
	});

	playerDataRep.value = playerData;
}

function sumGrenades(players: CSGOOutputAllplayer[]): TeamData['grenades'] {
	const nades = {
		he: 0,
		flash: 0,
		smoke: 0,
		fire: 0,
		decoy: 0
	}

	players.forEach(player => {
		const weaponObj = Object.values(player.weapons);
		weaponObj.forEach(weapon => {
			switch (weapon.name) {
				case 'weapon_hegrenade':
					nades.he++;
					break;
				case 'weapon_flashbang':
					nades.flash++;
					break;
				case 'weapon_smokegrenade':
					nades.smoke++;
					break;
				case 'weapon_incgrenade':
				case 'weapon_molotov':
					nades.fire++;
					break;
				case 'weapon_decoy':
					nades.decoy++;
					break;
				default:
					break;
			}
		});
	});

	return nades;
}

function letterToLetterEmoji(letter: string) {
	return String.fromCodePoint(letter.toLowerCase().charCodeAt(0) + 127365);
}
