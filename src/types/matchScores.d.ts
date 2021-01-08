export type MatchScores = MatchScoresItem[];

export interface MatchScoresItem {
	teamA: string;
	teamB: string;
	maps: {
		map: string;
		firstHalf: Score;
		secondHalf: Score;
		ot?: Score;
		/**
		 * If the map has been completed or not
		 */
		complete: boolean;
	}[];
	status: string;
	id: string;
}
export interface Score {
	teamA: number;
	teamB: number;
}
