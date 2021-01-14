import * as nodecgApiContext from './util/nodecg-api-context';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';

import { MapInfo, Match, Matches, NewMatch } from '../types/matches';
import { TeamsPreset } from '../types/team-preset';

const nodecg = nodecgApiContext.get();
const currentMatchRep = nodecg.Replicant<Match | undefined>('currentMatch');
const matchesRep = nodecg.Replicant<Matches>('matches');
const teamsRep = nodecg.Replicant<TeamsPreset>('teamPlayerPreset');

// If no current match set then start at the very beginning, a very good place to start
if (!currentMatchRep.value) {
	if (matchesRep.value.length > 0) {
		// nodecg.log.info('Setting current match to id: ' + matchOrderRep.value[0]);
		currentMatchRep.value = getFirstMatch();
	}
}

nodecg.listenFor('nextMatch', () => {
	if (!currentMatchRep.value) {
		currentMatchRep.value = getFirstMatch();
		return;
	}

	const currentMatchIndex = matchesRep.value.findIndex(match => match.id === currentMatchRep.value?.id);

	if (currentMatchIndex === -1) {
		nodecg.log.warn('No id found for the previous match, will start at beginning');
		currentMatchRep.value = getFirstMatch();
	}

	currentMatchRep.value = _.cloneDeep(matchesRep.value[currentMatchIndex + 1]);
});

nodecg.listenFor('prevMatch', () => {
	const currentMatchIndex = matchesRep.value.findIndex(match => match.id === currentMatchRep.value?.id);

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
		teamB
	};

	matchesRep.value.push(createdMatch);

	if (!currentMatchRep.value) {
		currentMatchRep.value = getFirstMatch();
	}
});

nodecg.listenFor('updateScore', (data: Match['maps']) => {
	const matchIndex = matchesRep.value.findIndex(match => match.id === currentMatchRep.value?.id);

	if (matchIndex === -1) {
		nodecg.log.error('Can\'t find match id in matches. Cannot update score.');
		return;
	}

	matchesRep.value[matchIndex].maps = data;
});

nodecg.listenFor('updateStatus', (status: string) => {
	const matchIndex = matchesRep.value.findIndex(match => match.id === currentMatchRep.value?.id);

	if (matchIndex === -1) {
		nodecg.log.error('Can\'t find match id in matches. Cannot update status.');
		return;
	}

	matchesRep.value[matchIndex].status = status;
});

nodecg.listenFor('updateMatchOrder', (newOrder: Matches) => {
	matchesRep.value = newOrder;
});

nodecg.listenFor('removeMatch', (id: string) => {
	const matchIndex = matchesRep.value.findIndex(match => match.id === id);

	if (matchIndex === -1) {
		nodecg.log.warn(`Could not find match: ${id} to remove.`)
		return;
	}

	matchesRep.value.splice(matchIndex, 1);
});

nodecg.listenFor('addMap', (data: MapInfo) => {
	if (!currentMatchRep.value) return;

	currentMatchRep.value.maps.push(data);

	const currentMatchIndex = matchesRep.value.findIndex(match => match.id === currentMatchRep.value?.id);
	matchesRep.value[currentMatchIndex].maps = _.cloneDeep(currentMatchRep.value.maps);
});

nodecg.listenFor('removeMap', (mapName: string) => {
	if (!currentMatchRep.value) return;

	const mapIndex = currentMatchRep.value.maps.findIndex(map => map.map === mapName);
	
	if (mapIndex === -1) return;

	currentMatchRep.value.maps.splice(mapIndex, 1);

	const currentMatchIndex = matchesRep.value.findIndex(match => match.id === currentMatchRep.value?.id);
	matchesRep.value[currentMatchIndex].maps = _.cloneDeep(currentMatchRep.value.maps);
});

nodecg.listenFor('reorderMap', (data: MapInfo) => {
	// if (!currentMatchRep.value) return;

	// currentMatchRep.value.maps.push(data);

	// const currentMatchIndex = matchesRep.value.findIndex(match => match.id === currentMatchRep.value?.id);
	// matchesRep.value[currentMatchIndex].maps = currentMatchRep.value.maps;
	console.log(data)
});

function getFirstMatch() {
	if (Object.keys(matchesRep.value).length > 0) {
		return _.cloneDeep(matchesRep.value[0]);
	}

	return undefined;
}
