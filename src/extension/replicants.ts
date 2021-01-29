import * as nodecgApiContext from './util/nodecg-api-context';

import { PlayerDataAll, TeamData } from '../types/extra-data';
import { PlayerDeath } from '../types/hlae';
import { MapPlayerData } from '../types/map-player';
import { Match, Matches } from '../types/matches';
import { BundleStatus } from '../types/bundle-status';
import { CSGO, CSGOAllplayer, CSGOPlayer, Map, CSGOBomb, CSGOPhaseCountdowns, CSGOGrenadesAll } from '../types/csgo-gsi';
import * as DummyData from './dummyData';
import { TeamsPreset } from '../types/team-preset';
import { Tournaments } from '../types/tournament';
import { GameSettings } from '../types/game-settings';

const nodecg = nodecgApiContext.get();

// Have one file initialize all replicants at the very start

/* Settings */

nodecg.Replicant<BundleStatus>('bundleStatus', {
	defaultValue: DummyData.bundleStatus
});
nodecg.Replicant<GameSettings>('gameSettings', {
	defaultValue: DummyData.gameSettings
});

/* Extra data */

nodecg.Replicant<PlayerDataAll>('playerData', {
	defaultValue: {},
	persistent: false
});

/* HLAE */

nodecg.Replicant<boolean>('hlaeActive', { defaultValue: false, persistent: false });
nodecg.Replicant<PlayerDeath[]>('matchKills', { defaultValue: [] });

/* Map interpretation */

nodecg.Replicant<Record<string, MapPlayerData>>('interpMapPlayers', {
	defaultValue: {},
	persistent: false
});
nodecg.Replicant<MapPlayerData[]>('mapPlayers', {
	defaultValue: [],
	persistent: false
});

/* Match scores/schedule/map selection */

nodecg.Replicant<Matches>('matches', { defaultValue: [] });
nodecg.Replicant<Match | undefined>('currentMatch');
nodecg.Replicant<string>('round30Winner', { defaultValue: '' });

/* CSGO Data / Server */

nodecg.Replicant<BundleStatus>('bundleStatus', {
	persistent: false
});
nodecg.Replicant<CSGO>('game', {
	defaultValue: DummyData.game,
	persistent: false
});
nodecg.Replicant<Map>('matchStats', {
	defaultValue: DummyData.match,
	persistent: false
});
nodecg.Replicant<CSGOAllplayer[]>('allPlayers', {
	defaultValue: [],
	persistent: false
});
nodecg.Replicant<CSGOPlayer>('observingPlayer', {
	defaultValue: DummyData.observingPlayer,
	persistent: false
});
nodecg.Replicant<CSGOBomb>('bomb', {
	defaultValue: DummyData.bomb,
	persistent: false
});
nodecg.Replicant<CSGOPhaseCountdowns>('phase', {
	defaultValue: DummyData.phase,
	persistent: false
});
nodecg.Replicant<TeamData>('teamOne', {
	defaultValue: DummyData.TeamData,
	persistent: false
});
nodecg.Replicant<TeamData>('teamTwo', {
	defaultValue: DummyData.TeamData,
	persistent: false
});
nodecg.Replicant<CSGOGrenadesAll>('mapGrenades', {
	defaultValue: DummyData.DummyGrenadesAll,
	persistent: false
});
nodecg.Replicant<number>('serverRate', {
	defaultValue: 0,
	persistent: false
});
nodecg.Replicant<MapPlayerData[]>('mapPlayers', {
	defaultValue: [],
	persistent: false
});

/* Team data */

nodecg.Replicant<TeamsPreset>('teamPlayerPreset', { defaultValue: { teams: {}, players: {} } });

/* Tournaments */

nodecg.Replicant<Tournaments>('tournaments', { defaultValue: {} });
nodecg.Replicant<string>('currentTournament', { defaultValue: '' });
