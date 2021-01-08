import * as nodecgApiContext from './util/nodecg-api-context';
import { cloneDeep } from 'lodash';

import { Schedule } from '../types/schedule';
import { TeamsPreset } from '../types/team-preset';

const nodecg = nodecgApiContext.get();
const currentMatchRep = nodecg.Replicant<string>('currentMatch');
const scheduleRep = nodecg.Replicant<Schedule>('schedule', { defaultValue: [] });
const teamRep = nodecg.Replicant<TeamsPreset>('teamPreset');

interface NewGame {
	teamA: string;
	teamB: string;
	time: string;
	matchType: string
}

nodecg.listenFor('addScheduleGame', (data: NewGame) => {
	const teamAData = teamRep.value.teams[data.teamA];
	const teamBData = teamRep.value.teams[data.teamB];

	if (!teamAData) {
		nodecg.log.error('Could not find team: ' + data.teamA);
		return;
	}

	if (!teamBData) {
		nodecg.log.error('Could not find team: ' + data.teamB);
		return;
	}

	const fullNewGame: Schedule[0] = {
		teamA: cloneDeep(teamAData),
		teamB: cloneDeep(teamBData),
		matchType: data.matchType,
		time: data.time,
		id: Date.now().toString() + 'a'	// Needs the "a" or else it will convert to a number
	};

	if (scheduleRep.value.length === 0) {
		currentMatchRep.value = fullNewGame.id;
	}

	scheduleRep.value.push(fullNewGame);

	nodecg.sendMessage('createNewMatchScores', fullNewGame.id);

});

nodecg.listenFor('reorderSchedule', newOrder => {
	scheduleRep.value = newOrder;
});

nodecg.listenFor('removeScheduleGame', id => {
	const gameIndex = scheduleRep.value.findIndex(game => game.id === id);

	if (gameIndex === -1) {
		nodecg.log.error('Could not find schedule id: ' + id);
		return;
	}

	// Remove scheduled game
	scheduleRep.value.splice(gameIndex, 1);

	// Change current match
	if (currentMatchRep.value === id) {
		if (scheduleRep.value.length === 0) {
			return;
		}

		if (gameIndex === 0) {
			currentMatchRep.value = scheduleRep.value[gameIndex + 1].id;
		} else {
			currentMatchRep.value = scheduleRep.value[gameIndex - 1].id;
		}
	}
});
