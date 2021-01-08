// Custom

// Premade
export interface CSGOOutput {
	provider: Provider;
	map: Map;
	round: Round;
	player: CSGOOutputPlayer;
	allplayers: Record<string, CSGOOutputAllplayer>;
	phaseCountdowns: CSGOOutputPhaseCountdowns;
	grenades: CSGOGrenadesAll;
	bomb: CSGOOutputBomb;
	previously: Previously;
}

export interface CSGOOutputAllplayer {
	steamId: string;
	name: string;
	observer_slot: number;
	team: 'CT' | 'T';
	state: StateClass;
	match_stats: MatchStats;
	weapons: Record<string, Weapon>;
	position: string;
	forward: string;
	clan?: string;
}

export interface MatchStats {
	kills: number;
	assists: number;
	deaths: number;
	mvps: number;
	score: number;
}

export interface StateClass {
	health: number;
	armor: number;
	helmet: boolean;
	flashed: number;
	burning: number;
	money: number;
	round_kills: number;
	round_killhs: number;
	round_totaldmg: number;
	equip_value: number;
	defusekit?: boolean;
	smoked?: number;
}

export interface Weapon {
	name: string;
	paintkit: string;
	type:
		| 'C4'
		| 'Grenade'
		| 'Knife'
		| 'Pistol'
		| 'Rifle'
		| 'SniperRifle'
		| 'Shotgun'
		| 'Submachine Gun'
		| 'Machine gun';
	ammo_clip?: number;
	ammo_clip_max?: number;
	ammo_reserve?: number;
	state: 'active' | 'holstered';
}

export interface CSGOOutputBomb {
	state: 'planted' | 'exploded' | 'carried' | 'planting' | 'dropped' | 'defusing' | 'defused';
	position: string;
	player?: string;
	countdown?: string;
}

export interface CSGOOutputGrenade {
	owner: string;
	position: string;
	velocity: string;
	lifetime: string;
	type: string;
	effecttime?: string;
	flames?:  Record<string, string>;
}

export interface CSGOGrenadesAll {
	[key: string]: CSGOOutputGrenade;
}

export interface Map {
	mode: string;
	name: string;
	phase: string;
	round: number;
	team_ct: Team;
	team_t: Team;
	num_matches_to_win_series: number;
	current_spectators: number;
	souvenirs_total: number;
	round_wins: {
		[key: string]:
			| 'ct_win_defuse'
			| 'ct_win_time'
			| 'ct_win_elimination'
			| 't_win_elimination'
			| 't_win_bomb';
	};
}

export interface Team {
	score: number;
	name?: string;
	consecutive_round_losses: number;
	timeouts_remaining: number;
	matches_won_this_series: number;
}

export interface CSGOOutputPhaseCountdowns {
	phase:
		| 'live'
		| 'bomb'
		| 'over'
		| 'freezetime'
		| 'paused'
		| 'defuse'
		| 'timeout_t'
		| 'timeout_ct'
		| 'warmup';
	phase_ends_in: string;
}

export interface CSGOOutputPlayer {
	steamid: string;
	clan: string;
	name: string;
	observer_slot: number;
	team: 'CT' | 'T';
	activity: string;
	state: StateClass;
	spectarget: string;
	position: string;
	forward: string;
}

export interface Previously {
	player: PreviouslyPlayer;
	allplayers: Record<string, PreviouslyAllplayer>;
	phase_countdowns: PreviouslyPhaseCountdowns;
	grenades: Record<string, PreviouslyGrenade>;
	bomb: PreviouslyBomb;
}

export interface PreviouslyAllplayer {
	position: string;
	forward: string;
	weapons?: Record<string, Weapon>;
}

export interface PreviouslyBomb {
	position: string;
}

export interface PreviouslyGrenade {
	position: string;
	velocity: string;
	lifetime: string;
}

export interface PreviouslyPhaseCountdowns {
	phaseEndsIn: string;
}

export interface PreviouslyPlayer {
	position: string;
	forward: string;
}

export interface Provider {
	name: string;
	appid: number;
	version: number;
	steamid: string;
	timestamp: number;
}

export interface Round {
	phase: string;
}
