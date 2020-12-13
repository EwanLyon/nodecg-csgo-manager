export interface ExtraMapData {
	map: string;
	team: '1' | '2' | 'Server';
	teamOneScore?: number;
	teamTwoScore?: number;
	ban: boolean;
}

export interface MapPlayerData {
	[steamId: string]: {
		position: number[];
		rotation: number[];
		ct: boolean;
		beingObserved: boolean;
		observerId: number;
	};
}
