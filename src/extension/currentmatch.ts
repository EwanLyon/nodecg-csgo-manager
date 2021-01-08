import * as nodecgApiContext from './util/nodecg-api-context';

import { Schedule } from '../types/schedule';
import { MatchScoresItem, MatchScores } from '../types/matchScores';

const nodecg = nodecgApiContext.get();
const currentMatchRep = nodecg.Replicant<string>('currentMatch');
const scheduleRep = nodecg.Replicant<Schedule>('schedule');
const matchScoresRep = nodecg.Replicant<MatchScores>('matchScores', { defaultValue: [] });

function createPastMatch(id: string) {
	if (matchScoresRep.value.find(match => match.id === id)) {
		nodecg.log.error(`Cannot create match: ${id} as one already exists`);
		return;
	}

	const scheduleIndex = scheduleRep.value.findIndex(game => game.id === id);

	if (scheduleIndex === -1) {
		nodecg.log.error(`Cannot create match: ${id} as no scheduled match exists for it`);
		console.log(scheduleRep.value);
		return;
	}

	const teamAName = scheduleRep.value[scheduleIndex].teamA.name;
	const teamBName = scheduleRep.value[scheduleIndex].teamB.name;

	const newMatch: MatchScoresItem = {
		id,
		maps: [],
		status: 'Soon',
		teamA: teamAName,
		teamB: teamBName
	};

	matchScoresRep.value.push(newMatch);
}

// If no current match set then start at the very beginning, a very good place to start
if (currentMatchRep.value === '') {
	if (scheduleRep.value.length > 0) {
		nodecg.log.info('Setting current match to id: ' + scheduleRep.value[0].id);
		currentMatchRep.value = scheduleRep.value[0].id;
	}
}

nodecg.listenFor('nextMatch', () => {
	if (currentMatchRep.value === '') {
		currentMatchRep.value = scheduleRep.value[0].id;
		return;
	}

	const currentMatchIndex = scheduleRep.value.findIndex(game => game.id === currentMatchRep.value.toString());

	if (currentMatchIndex === -1) {
		nodecg.log.warn('No id found for the previous match, will start at beginning');
		currentMatchRep.value = scheduleRep.value[0].id;
	}

	currentMatchRep.value = scheduleRep.value[currentMatchIndex + 1].id;
});

nodecg.listenFor('prevMatch', () => {
	const currentMatchIndex = scheduleRep.value.findIndex(game => game.id === currentMatchRep.value.toString());

	if (currentMatchIndex === -1) {
		nodecg.log.warn('No id found for the previous match, will start at beginning');
		currentMatchRep.value = scheduleRep.value[0].id;
	}

	currentMatchRep.value = scheduleRep.value[currentMatchIndex - 1].id;
});

// Currently unused
nodecg.listenFor('goToMatch', (id: string) => {
	const goToMatchIndex = scheduleRep.value.findIndex(game => game.id === id);

	if (goToMatchIndex === -1) {
		nodecg.log.warn('Could not find id');
		return;
	}

	currentMatchRep.value = scheduleRep.value[goToMatchIndex].id;
});

nodecg.listenFor('createNewMatchScores', (id: string) => {
	createPastMatch(id);
});

let attempts = 0;
nodecg.listenFor('updateScore', (data: MatchScoresItem['maps']) => {
	const matchScoresIndex = matchScoresRep.value.findIndex(match => match.id === currentMatchRep.value.toString());

	if (matchScoresIndex === -1) {
		nodecg.log.error('Can\'t find match id in match scores, making one now.');
		createPastMatch(currentMatchRep.value.toString());

		// Since we're calling the function inside the same function I'm putting in a saftey switch
		// # of attempts is arbitrary
		attempts++;
		if (attempts === 5) {
			// Really shouldn't happen
			nodecg.log.error('COULD NOT CREATE NEW MATCH!! ABORTING');
			return;
		}

		nodecg.sendMessage('updateScore', data);	// Re-run function with newly created match
		return;
	}

	attempts = 0;

	matchScoresRep.value[matchScoresIndex].maps = data;
});

nodecg.listenFor('updateStatus', (status: string) => {
	const matchScoresIndex = matchScoresRep.value.findIndex(match => match.id === currentMatchRep.value.toString());

	if (matchScoresIndex === -1) {
		nodecg.log.error('Can\'t find match id in match scores. Cannot update status.');
		return;
	}

	matchScoresRep.value[matchScoresIndex].status = status;
});
