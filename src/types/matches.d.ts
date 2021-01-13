import { Team } from './team-preset';

export type Matches = Match[];

// Used in creating new matches
export interface NewMatch {
	teamA: string;
	teamB: string;
	time: string;
	matchType: string;
}

export interface Match {
	teamA: Team;
	teamB: Team;
	maps: MapInfo[];
	status: string;
	time: string;
	matchType: string;
	id: string;
}

export interface Score {
	teamA: number;
	teamB: number;
}

export interface MapInfo {
	map: string;
	teamVeto: string;
	side: string;
	ban: boolean;
	firstHalf: Score;
	secondHalf: Score;
	ot?: Score;
	complete: boolean;
}
