export interface ExtraMapData {
	map: string;
	team: string;
	teamOneScore?: number;
	teamTwoScore?: number;
	ban: boolean;
	side: string;
	matchId: string;
}

export interface MapPlayerData {
	steamId: string;
	position: number[];
	rotation: number[];
	ct: boolean;
	beingObserved: boolean;
	observerSlot: number;
	health: number;
}
