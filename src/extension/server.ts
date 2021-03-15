/* eslint-disable camelcase */
import * as nodecgApiContext from './util/nodecg-api-context';
import http from 'http';
import _ from 'lodash';

import { BundleStatus } from '../../types/bundle-status';
import {
	Map,
	CSGOAllplayer,
	CSGOPlayer,
	CSGOBomb,
	CSGOPhaseCountdowns,
	CSGOGrenadesAll,
	CSGO,
} from '../../types/csgo-gsi';
import { TeamData } from '../../types/extra-data';
import { MapPlayerData } from '../../types/map-player';

const nodecg = nodecgApiContext.get();
const bundleStatus = nodecg.Replicant<BundleStatus>('bundleStatus');
const gameRep = nodecg.Replicant<CSGO>('game');
const matchStatsRep = nodecg.Replicant<Map>('matchStats');
const allPlayersRep = nodecg.Replicant<CSGOAllplayer[]>('allPlayers');
const observingPlayerRep = nodecg.Replicant<CSGOPlayer>('observingPlayer');
const bombRep = nodecg.Replicant<CSGOBomb>('bomb');
const phaseRep = nodecg.Replicant<CSGOPhaseCountdowns>('phase');
const teamOneRep = nodecg.Replicant<TeamData>('teamOne');
const teamTwoRep = nodecg.Replicant<TeamData>('teamTwo');
const mapGrenadesRep = nodecg.Replicant<CSGOGrenadesAll>('mapGrenades');
const serverRateRep = nodecg.Replicant<number>('serverRate');
const mapPlayersRep = nodecg.Replicant<MapPlayerData[]>('mapPlayers');
const round30Winner = nodecg.Replicant<string>('round30Winner');

let oldTime = 1;
const rollingAverage: number[] = [];

// Returns true if teamOne should be T's
function currentTeamSide(round: number): boolean {
	if (round < 15) {
		return true;
	}

	if (round >= 30) {
		// Overtime math
		return Boolean(Math.floor((round - 27) / 6) % 2);
	}

	return false;
}

function getFrequency(prevTime: number) {
	const delta = Date.now() - prevTime;
	const freq = (1 / delta) * 1000;
	oldTime = Date.now();
	return freq;
}

function calcFreq() {
	rollingAverage.push(getFrequency(oldTime));

	if (rollingAverage.length > 20) {
		rollingAverage.shift();
	}

	serverRateRep.value = rollingAverage.reduce((a, b) => a + b) / rollingAverage.length;
}

let sentFinishedMatch = false;

function handleData(srcData: string): void {
	// Convert steam id's displayed as numbers to string to solve rounding, bug in csgo gsi
	const srcJSON = JSON.parse(srcData.replace(/:\s*(\d{10,})/g, ': "$1"'));

	// Update match stats
	if (srcJSON.provider && srcJSON.player.activity !== 'menu') {
		// ServerRateRep.value = getFrequency(oldTime);
		calcFreq();

		// Update match once over
		if (srcJSON.map.phase === 'gameover' && !sentFinishedMatch) {
			nodecg.sendMessage('gameOver', srcJSON);
			sentFinishedMatch = true;
		} else if (srcJSON.map.phase !== 'gameover' && sentFinishedMatch) {
			sentFinishedMatch = false;
		}

		// Push all data into one replicant...
		gameRep.value = _.cloneDeep(srcJSON);

		// MATCH STATS
		// Set team scores so that they dont flip mid way
		const teamOneData = currentTeamSide(srcJSON.map.round)
			? srcJSON.map.team_t
			: srcJSON.map.team_ct;
		const teamTwoData = currentTeamSide(srcJSON.map.round)
			? srcJSON.map.team_ct
			: srcJSON.map.team_t;

		teamOneRep.value = {
			...teamOneRep.value,
			score: teamOneData.score,
			matchesWonThisSeries: teamOneData.matches_won_this_series,
			consecutiveRoundLosses: teamOneData.consecutive_round_losses,
		};

		teamTwoRep.value = {
			...teamTwoRep.value,
			score: teamTwoData.score,
			matchesWonThisSeries: teamTwoData.matches_won_this_series,
			consecutiveRoundLosses: teamTwoData.consecutive_round_losses,
		};

		matchStatsRep.value = srcJSON.map;

		// ALL PLAYERS
		const tempPlayersList = Object.entries(srcJSON.allplayers).map(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			([key, value]: [string, any]) => {
				value.steamId = key;
				if (value.observer_slot === 0) {
					value.observer_slot = 10;
				}

				return value as CSGOAllplayer;
			},
		);

		tempPlayersList.sort((a, b) => {
			return a.observer_slot - b.observer_slot;
		});

		allPlayersRep.value = tempPlayersList;

		// Map positions
		mapPlayersRep.value = mapData(tempPlayersList, srcJSON.player.steamid);

		// OBSERVING PLAYER
		observingPlayerRep.value = srcJSON.player;

		// BOMB
		bombRep.value = srcJSON.bomb;

		// Phase/Timer
		phaseRep.value = srcJSON.phase_countdowns;

		// All grenades
		mapGrenadesRep.value = srcJSON.grenades;

		if (
			srcJSON.map.round === 30 &&
			srcJSON.round.win_team &&
			round30Winner.value !== srcJSON.round.win_team
		) {
			round30Winner.value = srcJSON.round.win_team;
		}
	}
}

function handleIncoming(req: http.IncomingMessage, res: http.ServerResponse): void {
	if (req.method === 'POST') {
		res.writeHead(200, { 'Content-Type': 'text/html' });

		let body = '';
		req.on('data', (data) => {
			body += data;
		});

		req.on('end', () => {
			handleData(body);
			res.end('');
		});
	} else {
		console.log('Not expecting other request types...');
		res.writeHead(200, { 'Content-Type': 'text/html' });
		const html =
			'<html><body>HTTP Server at http://' +
			nodecg.config.host +
			':' +
			nodecg.bundleConfig.port +
			'</body></html>';
		res.end(html);
	}
}

const server = http.createServer(handleIncoming);

nodecg.listenFor('listenServer', () => {
	if (bundleStatus.value.isServerOn) {
		nodecg.log.info('Server is already running');
		return;
	}

	nodecg.log.info('Starting server on port ' + nodecg.bundleConfig.port);
	server.listen(nodecg.bundleConfig.port, nodecg.config.host);
	bundleStatus.value.isServerOn = true;
});

nodecg.listenFor('closeServer', () => {
	if (!bundleStatus.value.isServerOn) {
		nodecg.log.info('Server is already closed');
		return;
	}

	nodecg.log.info('Closing server on port ' + nodecg.bundleConfig.port);
	server.close();
	setImmediate(() => server.emit('close'));
	bundleStatus.value.isServerOn = false;
});

server.on('listening', () => {
	nodecg.log.info('Server started');
});

server.on('close', () => {
	nodecg.log.info('Server closed');
});

server.listen(nodecg.bundleConfig.port, nodecg.config.host);
bundleStatus.value.isServerOn = true;

// Map data here as it is as I want to minimise the time it take for the data to be processed
function mapData(allPlayerData: CSGOAllplayer[], observingId?: string) {
	const finalMapObj: MapPlayerData[] = [];

	allPlayerData.forEach((player) => {
		const playerObj: MapPlayerData = {
			steamId: player.steamId,
			position: player.position.split(', ').map(Number),
			rotation: player.forward.split(', ').map(Number),
			ct: player.team === 'CT',
			beingObserved: player.steamId === observingId,
			observerSlot: player.observer_slot,
			health: player.state.health,
		};

		finalMapObj.push(playerObj);
	});

	return finalMapObj;
}

nodecg.listenFor('sendTestData', (srcData: CSGO) => {
	if (srcData) {
		handleData(JSON.stringify(srcData));
	}
});
