import * as nodecgApiContext from './util/nodecg-api-context';
const nodecg = nodecgApiContext.get();

import { MapPlayerData } from '../types/map-player';
import { CSGOPhaseCountdowns } from '../types/csgo-gsi';

const interpMapPlayersRep = nodecg.Replicant<Record<string, MapPlayerData>>('interpMapPlayers');

const mapPlayersRep = nodecg.Replicant<MapPlayerData[]>('mapPlayers');

const phaseRep = nodecg.Replicant<CSGOPhaseCountdowns>('phase');

// 10 array's for 10 players, in future maybe have this be dynamic
const playerBuffer: MapPlayerData[][] = [[], [], [], [], [], [], [], [], [], []];

const INTERPOLATION_STEPS = 10;

let haveReset = false;

setInterval(() => {
	const clonedMapPlayers = [...mapPlayersRep.value];

	const newInterp: Record<string, MapPlayerData> = {};
	playerBuffer.forEach((playersSet, i) => {
		if (clonedMapPlayers.length === 0) return;

		playersSet.unshift(clonedMapPlayers[i]);

		if (phaseRep.value.phase === 'freezetime' && !haveReset) {
			haveReset = true;
			playersSet = playersSet.slice(0, 1);
		} else {
			playersSet = playersSet.slice(0, INTERPOLATION_STEPS);
		}

		let avgX = 0;
		let avgY = 0;
		let avgZ = 0;
		let avgAngleX = 0;
		let avgAngleY = 0;
		try {
			// This is way less code than averaging multiple arrays
			avgX = playersSet.reduce((a, b) => a + b.position[0], 0) / playersSet.length;
			avgY = playersSet.reduce((a, b) => a + b.position[1], 0) / playersSet.length;
			avgZ = playersSet.reduce((a, b) => a + b.position[2], 0) / playersSet.length;
			avgAngleX = playersSet.reduce((a, b) => a + b.rotation[0], 0) / playersSet.length;
			avgAngleY = playersSet.reduce((a, b) => a + b.rotation[1], 0) / playersSet.length;
		} catch (error) {
			// Pretty much resulted in just "warn: [nodecg-csgo-manager] Failed to average map positions and angles: TypeError: Cannot read property 'position' of undefined"
			// nodecg.log.warn('Failed to average map positions and angles: ' + error);
		}

		if (!clonedMapPlayers[i]) return;

		newInterp[clonedMapPlayers[i].steamId] = {
			...clonedMapPlayers[i],
			position: [avgX, avgY, avgZ],
			rotation: [avgAngleX, avgAngleY, clonedMapPlayers[i].rotation[2]],
		};
	});

	interpMapPlayersRep.value = newInterp;

	if (phaseRep.value.phase === 'live' && haveReset) {
		haveReset = false;
	}
}, 20);
