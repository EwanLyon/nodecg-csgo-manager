import * as nodecgApiContext from './util/nodecg-api-context';
import fs from 'fs';
import _ from 'lodash';
import { HLTV } from 'hltv';
const nodecg = nodecgApiContext.get();

import { TeamsPreset, Team, Player } from '../../types/team-preset';
import { PlayerDataAll } from '../../types/extra-data';

interface Asset {
	base: string;
	bundleName: string;
	category: string;
	ext: string;
	name: string;
	sum: string;
	url: string;
}

const playerDataRep = nodecg.Replicant<PlayerDataAll>('playerData');
const teamPresetsRep = nodecg.Replicant<TeamsPreset>('teamPlayerPreset');
const teamPresetAssetsRep = nodecg.Replicant<Asset[]>('assets:teamPreset');

nodecg.listenFor('exportTeams', () => {
	nodecg.log.info('Exporting teams');
	const mainPreset: TeamsPreset = { teams: {}, players: {} };

	const teamObjs = teamPresetsRep.value.teams;
	const playerList = teamPresetsRep.value.players;

	mainPreset.players = playerList;

	mainPreset.teams = teamObjs;

	let date = new Date().toLocaleString('en-AU', {
		hour12: false,
		second: '2-digit',
		minute: '2-digit',
		hour: '2-digit',
		day: '2-digit',
		month: '2-digit',
		year: '2-digit',
	});
	date = date.replace(/[/,:]/g, '');
	date = date.replace(/ /g, '_');
	fs.writeFile(
		`./assets/csgo-layouts/teamPreset/${date}.json`,
		JSON.stringify(mainPreset),
		(err) => {
			if (err) {
				nodecg.log.error('Failed writing team presets: ' + err.message);
			} else {
				nodecg.log.info('TeamPresets file written');
			}
		},
	);
});

function updateTeamPreset(newVal: Asset[]): void {
	nodecg.log.info('Updating team presets');
	const newTeamPresets: TeamsPreset = { teams: {}, players: {} };

	newVal.forEach((teamsFile) => {
		fs.readFile(`./${teamsFile.url}`, 'utf-8', (err, jsonString) => {
			if (err) {
				nodecg.log.error('Failed reading: ' + teamsFile.url + ' ' + err.message);
				return;
			}

			try {
				const teamsJSON = JSON.parse(jsonString);
				if (teamsJSON.teams) {
					teamsJSON.teams.forEach((team: Team) => {
						newTeamPresets.teams[team.name] = team;
					});
				}

				if (teamsJSON.players) {
					teamsJSON.players.forEach((player: Player) => {
						newTeamPresets.players[player.steamId] = player;
					});
				}
			} catch (error) {
				nodecg.log.error('Failed parsing: ' + teamsFile.url + ' ' + error.message);
			}
		});
	});

	teamPresetsRep.value = newTeamPresets;
}

teamPresetAssetsRep.on('change', (newVal) => {
	updateTeamPreset(newVal);
});

function pushNewPlayerData(player: TeamsPreset['players'][0]): void {
	playerDataRep.value[player.steamId] = {
		totalDamage: 0,
		adr: 0,
		country: player.country,
		image: player.profilePicture,
		name: player.realName,
	};
}

nodecg.listenFor('pushNewPlayerData', (player: TeamsPreset['players'][0]) => {
	nodecg.log.info('Pushing new player: ' + player.steamId);
	pushNewPlayerData(player);
});

nodecg.listenFor('newTeam', (data: { name: string; alias: string; logo?: string }) => {
	nodecg.log.info('Adding ' + data.alias);
	const teamObj: Team = {
		alias: data.alias,
		name: data.name,
		logo: data.logo,
	};
	// Clear undefined props
	_.pickBy(teamObj, _.identity);

	teamPresetsRep.value.teams[teamObj.name] = teamObj;

	nodecg.sendMessage('newTeamPlayerResponse');
});

nodecg.listenFor(
	'newPlayer',
	(data: { name?: string; steamId: string; pfp?: string; country?: string }) => {
		nodecg.log.info('Adding ' + data.steamId);
		const playerObj: Player = {
			steamId: data.steamId,
			realName: data.name,
			country: data.country,
			profilePicture: data.pfp,
		};
		// Clear undefined props
		_.pickBy(playerObj, _.identity);

		teamPresetsRep.value.players[playerObj.steamId] = playerObj;

		nodecg.sendMessage('newTeamPlayerResponse');
	},
);

nodecg.listenFor('getHLTVTeam', (id: number) => {
	HLTV.getTeam({ id }).then((res) => {
		nodecg.sendMessage('hltvTeamReturn', res);
	});
});
