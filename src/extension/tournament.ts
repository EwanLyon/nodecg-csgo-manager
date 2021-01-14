import * as nodecgApiContext from './util/nodecg-api-context';
import _ from 'lodash';
import { v4 as uuid } from 'uuid';

import { Tournaments, TournamentSetup, Tournament, Fixtures, SingleElimination, DoubleElimination, TournamentEdit } from '../types/tournament';

const nodecg = nodecgApiContext.get();

const tournamentsRep = nodecg.Replicant<Tournaments>('tournaments');
const currentTournamentRep = nodecg.Replicant<string>('currentTournament');

nodecg.listenFor('newTournament', (data: TournamentSetup) => {
	if (!isFixtureType(data.fixtureType)) {
		nodecg.log.warn(`Tried to make tournament using fixture type: ${data.fixtureType}. This is not a supported type.`)
		return;
	}

	const fixture: Tournament['fixture'] | undefined = createFixtureData(data.fixtureType, data.size);

	if (!fixture) {
		nodecg.log.warn(`Tried to make tournament data fixture data: ${data}. This is not supported fixture data.`)
		return;
	}

	const newTournament: Tournament = {
		id: uuid(), // Putting 'a' forces it to be a string
		logo: data.logo,
		name: data.name,
		fixture: fixture,
		active: false
	}

	tournamentsRep.value[newTournament.id] = newTournament;
});

nodecg.listenFor('editTournament', (data: TournamentEdit) => {
	if (!isFixtureType(data.fixtureType)) {
		nodecg.log.warn(`Tried to make tournament using fixture type: ${data.fixtureType}. This is not a supported type.`)
		return;
	}
	const mutableTournament = _.cloneDeep(tournamentsRep.value[data.id]);

	// Figure out what to fill in for size
	let fixtureSize = 2;
	if (mutableTournament.fixture.type === 'single-elimination') {
		fixtureSize = mutableTournament.fixture.matches[0].length * 2;
	} else if (mutableTournament.fixture.type === 'double-elimination') {
		fixtureSize = mutableTournament.fixture.winnerMatches[0].length * 2;
	}

	if (mutableTournament.fixture.type !== data.fixtureType || fixtureSize !== data.size) {
		// Fixture types do not line up, edit fixture data
		const newFixtureData = createFixtureData(data.fixtureType, data.size);

		if (!newFixtureData) {
			nodecg.log.warn(`Tried to make tournament data fixture data: ${data}. This is not supported fixture data.`)
			return;
		}

		mutableTournament.fixture = newFixtureData;
	}

	mutableTournament.logo = data.logo;
	mutableTournament.name = data.name;

	tournamentsRep.value[data.id] = mutableTournament;
});

nodecg.listenFor('deleteTournament', (id: string) => {
	delete tournamentsRep.value[id];
})

function isFixtureType(fixture: string): fixture is Fixtures['type'] {
	return fixture === 'single-elimination' || fixture === 'double-elimination';
}

function isSingleElimination(fixture: Fixtures): fixture is SingleElimination {
	return fixture.type === 'single-elimination';
}

function isDoubleElimination(fixture: Fixtures): fixture is DoubleElimination {
	return fixture.type === 'double-elimination';
}

function createFixtureData(fixtureType: Fixtures['type'], extraData?: TournamentSetup['size']) {
	switch (fixtureType) {
		case 'single-elimination':
			const singleFixture: SingleElimination = {
				type: 'single-elimination',
				matches: createSingleFixtureArrays(extraData || 0)
			}
			return singleFixture;
		case 'double-elimination':
			const doubleFixture: DoubleElimination = {
				type: 'double-elimination',
				winnerMatches: [...createSingleFixtureArrays(extraData || 0), [''], ['']],
				loserMatches: [...createSingleFixtureArrays((extraData || 0) / 2), ...createSingleFixtureArrays((extraData || 0) / 2)].sort((a, b) => b.length - a.length)
			};
			return doubleFixture;

		default:
			break;
	}

	return undefined;
}

function createSingleFixtureArrays(teams: number) {
	if (!powerOf2(teams)) return [];

	const topArray = [];
	let remainingMatches = teams / 2;	// Divided by 2 since each team versus each other
	const totalRounds = Math.log2(teams);
	for (let i = 0; i < totalRounds; i++) {
		const roundArrays = [];
		for (let j = 0; j < remainingMatches; j++) {
			roundArrays.push('');
		}
		topArray.push(roundArrays);
		remainingMatches = remainingMatches / 2;
	}

	return topArray;
}

function powerOf2(v: number) {
	return v && !(v & (v - 1));
}

nodecg.listenFor('setActiveTournament', (id: string) => {
	// Allow no tournament to be set as the active tournament
	if (!tournamentsRep.value[id] && id !== '') {
		nodecg.log.warn(`Could not set the current tournament to "${id}" as it is not in the database.`);
		return;
	}

	currentTournamentRep.value = id;
});

nodecg.listenFor('setSingleElimMatch', (data: { tournamentId: string, matchId: string, round: number, match: number }) => {
	const mutableTournament = _.cloneDeep(tournamentsRep.value[data.tournamentId]);
	if (isSingleElimination(mutableTournament.fixture)) {
		mutableTournament.fixture.matches[data.round][data.match] = data.matchId;
		tournamentsRep.value[data.tournamentId] = mutableTournament;
	} else {
		nodecg.log.warn(`Tried to modify a single elimination fixture when the tournament edited is : ${tournamentsRep.value[data.tournamentId].fixture.type}`);
		return;
	}
});

nodecg.listenFor('setDoubleElimMatch', (data: { tournamentId: string, matchId: string, round: number, match: number, loserBracket: boolean }) => {
	const mutableTournament = _.cloneDeep(tournamentsRep.value[data.tournamentId]);
	if (isDoubleElimination(mutableTournament.fixture)) {
		if (data.loserBracket) {
			mutableTournament.fixture.loserMatches[data.round][data.match] = data.matchId;
		} else {
			mutableTournament.fixture.winnerMatches[data.round][data.match] = data.matchId;
		}
		tournamentsRep.value[data.tournamentId] = mutableTournament;
	} else {
		nodecg.log.warn(`Tried to modify a double elimination fixture when the tournament edited is : ${tournamentsRep.value[data.tournamentId].fixture.type}`);
		return;
	}
});
