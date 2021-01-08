export type MatchScores = MatchScoresItem[];

export interface MatchScoresItem {
	teamA: string;
	teamB: string;
	maps: MapInfo[];
	status: string;
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
