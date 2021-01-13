export type Tournaments = Record<string, Tournament>;

export interface TournamentSetup {
	name: string;
	logo: string;
	fixtureType: string;
	size?: number;	// Size can mean different things for different fixture types. e.g. Single Elim it means # of starting teams
}

export interface TournamentEdit extends TournamentSetup {
	id: string;
}

export interface Tournament {
	id: string;
	name: string;
	logo: string;
	fixture: Fixtures;
	active: boolean;
}

type Fixtures = SingleElimination | DoubleElimination;

export interface SingleElimination {
	type: 'single-elimination',
	matches: string[][];
}

export interface DoubleElimination {
	type: 'double-elimination',
	winnerMatches: string[][];
	loserMatches: string[][];
}
