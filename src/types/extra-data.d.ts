export interface PlayerData {
	totalDamage: number;
	adr: number;
	image?: string;
	country?: string;
	name?: string;
}

export interface PlayerDataAll {
	[key: string]: PlayerData;
}

export interface TeamData {
	totalMoney: number;
	equipmentValue: number;
	grenades: Grenades;
	players: string[];
	name: string;
	teamURL: string;
	score: number;
	matchesWonThisSeries: number;
	consecutiveRoundLosses: number;
}

interface Grenades {
	he: number,
	flash: number,
	smoke: number,
	fire: number,
	decoy: number
}
