/* eslint-disable @typescript-eslint/camelcase */
import {
	Map,
	CSGOOutputAllplayer,
	CSGOOutputPlayer,
	CSGOOutputBomb,
	CSGOOutputPhaseCountdowns,
	CSGOOutputGrenade,
	CSGOGrenadesAll,
	CSGOOutput
} from '../types/csgo-gsi';
import { GameSettings } from '../types/game-settings';
import { BundleStatus } from '../types/bundle-status';
import { PlayerDataAll, TeamData as ITeamData } from '../types/extra-data';
import { TeamsPreset } from '../types/team-preset';

export const match: Map = {
	mode: 'competitive',
	name: 'de_dust2',
	phase: 'live',
	round: 0,
	team_ct: {
		score: 0,
		consecutive_round_losses: 0,
		timeouts_remaining: 0,
		matches_won_this_series: 0
	},
	team_t: {
		score: 0,
		consecutive_round_losses: 0,
		timeouts_remaining: 0,
		matches_won_this_series: 0
	},
	num_matches_to_win_series: 0,
	current_spectators: 0,
	souvenirs_total: 0,
	round_wins: {}
};

export const player: CSGOOutputAllplayer[] = [
	{
		steamId: '-1',
		name: 'Username',
		observer_slot: 0,
		team: 'T',
		state: {
			health: 100,
			armor: 0,
			helmet: false,
			flashed: 0,
			burning: 0,
			money: 0,
			round_kills: 0,
			round_killhs: 0,
			round_totaldmg: 0,
			equip_value: 0
		},
		match_stats: {
			kills: 0,
			assists: 0,
			deaths: 0,
			mvps: 0,
			score: 0
		},
		weapons: {
			weapon_0: {
				name: 'weapon_knife_t',
				paintkit: 'default',
				type: 'Knife',
				state: 'holstered'
			}
		},
		position: '0, 0, 0',
		forward: '0, 0, 0'
	}
];

export const observingPlayer: CSGOOutputPlayer = {
	steamid: '-1',
	clan: '',
	name: 'PlayerName',
	observer_slot: 0,
	team: 'T',
	activity: 'textinput',
	state: {
		health: 100,
		armor: 0,
		helmet: false,
		flashed: 0,
		smoked: 0,
		burning: 0,
		money: 0,
		round_kills: 0,
		round_killhs: 0,
		round_totaldmg: 0,
		equip_value: 0
	},
	spectarget: '0',
	position: '0, 0, 0',
	forward: '0, 0, 0'
};

export const bomb: CSGOOutputBomb = {
	state: 'carried',
	position: '0, 0, 0',
	player: '-1'
};

export const phase: CSGOOutputPhaseCountdowns = {
	phase: 'live',
	phase_ends_in: '120'
};

export const bundleStatus: BundleStatus = {
	isServerOn: false
};

export const gameSettings: GameSettings = {
	bombPlantTime: 3,
	bombTime: 40,
	kitDefusedTime: 5,
	noKitDefuseTime: 10
};

export const ExtraData: PlayerDataAll = {
	'-1': {
		totalDamage: 0,
		adr: 0
	}
};

export const TeamData: ITeamData = {
	equipmentValue: 10000,
	totalMoney: 10000,
	grenades: {
		he: 0,
		flash: 0,
		smoke: 0,
		fire: 0,
		decoy: 0
	},
	players: ['-1'],
	score: 0,
	name: 'Terrorists',
	consecutiveRoundLosses: 0,
	matchesWonThisSeries: 0,
	teamURL: '../shared/media/T_Icon.png'
};

// For initialization in server.ts
export const TeamDataTwo: ITeamData = {
	...TeamData,
	name: 'Counter-Terrorists',
	teamURL: '../shared/media/CT_Icon.png'
};

export const DummyGrenades: CSGOOutputGrenade = {
	owner: '-1',
	position: '0, 0, 0',
	velocity: '0, 0, 0',
	lifetime: '0',
	type: ''
};

export const DummyGrenadesAll: CSGOGrenadesAll = {
	'100': DummyGrenades
};

export const DummyTeamsPreset: TeamsPreset = {
	teams: {},
	players: {}
};

export const game: CSGOOutput = {
	provider: {
		name: "Counter-Strike: Global Offensive",
		appid: 730,
		version: 13697,
		steamid: "76561198046005090",
		timestamp: 1558521542
	},
	allplayers: {},
	bomb: bomb,
	grenades: DummyGrenadesAll,
	map: match,
	phaseCountdowns: phase,
	player: observingPlayer,
	round: {
		phase: "live"
	},
	previously: {
		player: {
			position: "0.00, 0.00, 0.00",
			forward: "0.00, 0.00, 0.00"
		},
		allplayers: {},
		phase_countdowns: {
			phaseEndsIn: "120"
		},
		grenades: {},
		bomb: {
			position: "0.00, 0.00, 0.00"
		}
	}
}
