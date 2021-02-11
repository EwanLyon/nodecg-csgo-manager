import * as nodecgApiContext from './util/nodecg-api-context';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';

import { MapInfo, Match, Matches, NewMatch } from '../types/matches';
import { TeamsPreset } from '../types/team-preset';
import { CSGO } from '../types/csgo-gsi';
import { PlayerDeath } from '../types/hlae';

const nodecg = nodecgApiContext.get();
const currentMatchRep = nodecg.Replicant<Match | undefined>('currentMatch');
const matchesRep = nodecg.Replicant<Matches>('matches');
const teamsRep = nodecg.Replicant<TeamsPreset>('teamPlayerPreset');
const round30Winner = nodecg.Replicant<string>('round30Winner');
const matchKills = nodecg.Replicant<PlayerDeath[]>('matchKills');

// If no current match set then start at the very beginning, a very good place to start
if (!currentMatchRep.value) {
	if (matchesRep.value.length > 0) {
		// Nodecg.log.info('Setting current match to id: ' + matchOrderRep.value[0]);
		currentMatchRep.value = getFirstMatch();
	}
}

nodecg.listenFor('nextMatch', () => {
	if (!currentMatchRep.value) {
		currentMatchRep.value = getFirstMatch();
		return;
	}

	const currentMatchIndex = matchesRep.value.findIndex(
		(match) => match.id === currentMatchRep.value?.id,
	);

	if (currentMatchIndex === -1) {
		nodecg.log.warn('No id found for the previous match, will start at beginning');
		currentMatchRep.value = getFirstMatch();
	}

	currentMatchRep.value = _.cloneDeep(matchesRep.value[currentMatchIndex + 1]);
	matchKills.value = []; // Clear match kills since we are on a new one now
});

nodecg.listenFor('prevMatch', () => {
	const currentMatchIndex = matchesRep.value.findIndex(
		(match) => match.id === currentMatchRep.value?.id,
	);

	if (currentMatchIndex === -1) {
		nodecg.log.warn('No id found for the previous match, will start at beginning');
		currentMatchRep.value = getFirstMatch();
	}

	currentMatchRep.value = _.cloneDeep(matchesRep.value[currentMatchIndex - 1]);
});

nodecg.listenFor('createNewMatch', (newMatch: NewMatch) => {
	const teamA = _.cloneDeep(teamsRep.value.teams[newMatch.teamA]);
	const teamB = _.cloneDeep(teamsRep.value.teams[newMatch.teamB]);

	const matchId = uuid();

	const createdMatch: Match = {
		id: matchId,
		maps: [],
		status: 'Soon',
		time: newMatch.time,
		matchType: newMatch.matchType,
		teamA,
		teamB,
	};

	matchesRep.value.push(createdMatch);

	if (!currentMatchRep.value) {
		currentMatchRep.value = getFirstMatch();
	}
});

nodecg.listenFor('updateScore', (data: Match['maps']) => {
	if (!currentMatchRep.value) return;

	const matchIndex = matchesRep.value.findIndex(
		(match) => match.id === currentMatchRep.value?.id,
	);

	if (matchIndex === -1) {
		nodecg.log.error("Can't find match id in matches. Cannot update score.");
		return;
	}

	currentMatchRep.value.maps = data;
	matchesRep.value[matchIndex].maps = _.cloneDeep(data);
});

nodecg.listenFor('updateStatus', (status: string) => {
	if (!currentMatchRep.value) return;

	const matchIndex = matchesRep.value.findIndex(
		(match) => match.id === currentMatchRep.value?.id,
	);

	if (matchIndex === -1) {
		nodecg.log.error("Can't find match id in matches. Cannot update status.");
		return;
	}

	currentMatchRep.value.status = status;
	matchesRep.value[matchIndex].status = _.clone(status);
});

nodecg.listenFor('updateMatchOrder', (newOrder: Matches) => {
	matchesRep.value = newOrder;
});

nodecg.listenFor('removeMatch', (id: string) => {
	const matchIndex = matchesRep.value.findIndex((match) => match.id === id);

	if (matchIndex === -1) {
		nodecg.log.warn(`Could not find match: ${id} to remove.`);
		return;
	}

	matchesRep.value.splice(matchIndex, 1);

	if (id === currentMatchRep.value?.id) {
		currentMatchRep.value = getFirstMatch();
	}
});

nodecg.listenFor('addMap', (data: MapInfo) => {
	if (!currentMatchRep.value) return;

	currentMatchRep.value.maps.push(data);

	const currentMatchIndex = matchesRep.value.findIndex(
		(match) => match.id === currentMatchRep.value?.id,
	);
	matchesRep.value[currentMatchIndex].maps = _.cloneDeep(currentMatchRep.value.maps);
});

nodecg.listenFor('removeMap', (mapName: string) => {
	if (!currentMatchRep.value) return;

	const mapIndex = currentMatchRep.value.maps.findIndex((map) => map.map === mapName);

	if (mapIndex === -1) return;

	currentMatchRep.value.maps.splice(mapIndex, 1);

	const currentMatchIndex = matchesRep.value.findIndex(
		(match) => match.id === currentMatchRep.value?.id,
	);
	matchesRep.value[currentMatchIndex].maps = _.cloneDeep(currentMatchRep.value.maps);
});

nodecg.listenFor('reorderMaps', (data: MapInfo[]) => {
	if (!currentMatchRep.value) return;

	currentMatchRep.value.maps = data;

	const currentMatchIndex = matchesRep.value.findIndex(
		(match) => match.id === currentMatchRep.value?.id,
	);
	matchesRep.value[currentMatchIndex].maps = _.cloneDeep(currentMatchRep.value.maps);
});

nodecg.listenFor('setVetoSide', (data: { mapName: string; side: string }) => {
	if (!currentMatchRep.value) return;

	const mapIndex = currentMatchRep.value.maps.findIndex((map) => map.map === data.mapName);

	if (mapIndex === -1) return;

	currentMatchRep.value.maps[mapIndex].side = data.side;

	const currentMatchIndex = matchesRep.value.findIndex(
		(match) => match.id === currentMatchRep.value?.id,
	);
	matchesRep.value[currentMatchIndex].maps = _.cloneDeep(currentMatchRep.value.maps);
});

function getFirstMatch() {
	if (Object.keys(matchesRep.value).length > 0) {
		return _.cloneDeep(matchesRep.value[0]);
	}

	return undefined;
}

// Returns true if teamOne should be T's
function currentTeamSide(round: number): boolean {
	if (round < 15) {
		return true;
	}

	if (round >= 30) {
		// Overtime math
		return Boolean(Math.floor((round - 27) / 6) % 2);
	}

	return false;
}

nodecg.listenFor('gameOver', (game: CSGO) => {
	nodecg.log.info('Game over!');
	const teamOneData = currentTeamSide(game.map.round) ? game.map.team_t : game.map.team_ct;
	const teamTwoData = currentTeamSide(game.map.round) ? game.map.team_ct : game.map.team_t;

	if (!currentMatchRep.value) {
		return;
	}

	const roundWinsArray = Object.values(game.map.round_wins);

	// First half data
	let teamAFirst = 0;
	let teamBFirst = 0;
	for (let i = 0; i < Math.min(15, roundWinsArray.length); i++) {
		roundWinsArray[i].substring(0, 2) === 'ct' ? teamBFirst++ : teamAFirst++;	/* eslint-disable-line */
	}

	// Second half data
	let teamASecond = 0;
	let teamBSecond = 0;
	for (let i = 15; i < Math.min(30, roundWinsArray.length); i++) {
		roundWinsArray[i].substring(0, 2) === 'ct' ? teamASecond++ : teamBSecond++;	/* eslint-disable-line */
	}

	if (round30Winner.value === '' && game.map.round >= 29) {
		nodecg.log.warn(
			'Round 30 was not recorded. Please correct the final scores in the nodecg dashboard.',
		);
	} else if (round30Winner.value !== '') {
		round30Winner.value === 'CT' ? teamASecond++ : teamBSecond++;	/* eslint-disable-line */
	}

	// Overtime
	const teamAOT =
		(currentTeamSide(game.map.round) ? game.map.team_t : game.map.team_ct).score -
		(teamAFirst + teamASecond);
	const teamBOT =
		(currentTeamSide(game.map.round) ? game.map.team_ct : game.map.team_t).score -
		(teamAFirst + teamASecond);

	// Find related map
	const mapIndex = currentMatchRep.value.maps.findIndex(
		(map) => map.map.toLowerCase() === game.map.name.substring(3),
	);

	if (mapIndex === -1) {
		nodecg.log.warn(
			`Tried to save final data but could not find ${game.map.name} in the current matches.`,
		);
		nodecg.log.warn(
			`Final Scores: \n${
				currentMatchRep.value.teamA.name
			}: ${teamAFirst} ${teamASecond} ${teamAOT} | ${
				(currentTeamSide(game.map.round) ? game.map.team_t : game.map.team_ct).score
			}\n${currentMatchRep.value.teamB.name}: ${teamBFirst} ${teamBSecond} ${teamBOT} | ${
				(currentTeamSide(game.map.round) ? game.map.team_ct : game.map.team_t).score
			}`,
		);
		return;
	}

	if (currentMatchRep.value.maps[mapIndex].ban) {
		nodecg.log.warn(
			`Match saving to has the map as a banned veto. Are you on the correct match? Saving anyway...`,
		);
	}

	currentMatchRep.value.maps[mapIndex] = {
		...currentMatchRep.value.maps[mapIndex],
		complete: true,
		totalScore: {
			teamA: teamOneData.score,
			teamB: teamTwoData.score,
		},
		firstHalf: {
			teamA: teamAFirst,
			teamB: teamBFirst,
		},
		secondHalf: {
			teamA: teamASecond,
			teamB: teamBSecond,
		},
		ot: {
			teamA: teamAOT,
			teamB: teamBOT,
		},
		roundWins: roundWinsArray,
	};

	const currentMatchIndex = matchesRep.value.findIndex(
		(match) => match.id === currentMatchRep.value?.id,
	);
	matchesRep.value[currentMatchIndex] = _.cloneDeep(currentMatchRep.value);
});

nodecg.listenFor('switchTeamAandB', () => {
	if (!currentMatchRep.value) return;

	const teamATemp = _.cloneDeep(currentMatchRep.value?.teamA);
	currentMatchRep.value.teamA = _.cloneDeep(currentMatchRep.value.teamB);
	currentMatchRep.value.teamB = teamATemp;

	const currentMatchIndex = matchesRep.value.findIndex(
		(match) => match.id === currentMatchRep.value?.id,
	);
	matchesRep.value[currentMatchIndex] = _.cloneDeep(currentMatchRep.value);
});
