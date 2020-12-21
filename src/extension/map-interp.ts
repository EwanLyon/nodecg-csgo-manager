import * as nodecgApiContext from './util/nodecg-api-context';
import _ from 'lodash';
const nodecg = nodecgApiContext.get();

import { MapPlayerData } from '../types/map-data';
import { CSGOOutputPhaseCountdowns } from '../types/csgo-gsi';

const interpMapPlayersRep = nodecg.Replicant<{ [key: string]: MapPlayerData }>('interpMapPlayers', {
	defaultValue: {},
	persistent: false
});

const mapPlayersRep = nodecg.Replicant<MapPlayerData[]>('mapPlayers', {
	defaultValue: [],
	persistent: false
});

const phaseRep = nodecg.Replicant<CSGOOutputPhaseCountdowns>('phase');

// 10 array's for 10 players, in future maybe have this be dynamic
const playerBuffer: MapPlayerData[][] = [[], [], [], [], [], [], [], [], [], []];

// const INTERPOLATION_STEPS = 3;
const NEW_INTERPOLATION_STEPS = 10;
// let interpSteps = 0;

let haveReset = false;

setInterval(() => {
	// console.log('test');
	// const oldPos = interpMapPlayersRep.value;
	const clonedMapPlayers = [...mapPlayersRep.value];
	// if (interpSteps >= INTERPOLATION_STEPS) {
	// 	// If interpolation has been completed, set players to final positions
	// 	clonedMapPlayers.forEach((player) => {
	// 		oldPos[player.steamId] = _.cloneDeep(player);
	// 	});
	// 	interpSteps = 0;
	// 	interpMapPlayersRep.value = oldPos;
	// 	return;
	// }

	// clonedMapPlayers.forEach((player) => {
	// 	// See if player exists in list
	// 	if (interpMapPlayersRep.value[player.steamId] === undefined) {
	// 		oldPos[player.steamId] = _.cloneDeep(player);
	// 		return;
	// 	}

	// 	// Check that the position and rotations are numbers
	// 	if (isNaN(interpMapPlayersRep.value[player.steamId].position[0])) {
	// 		oldPos[player.steamId].position = [0, 0, 0];
	// 	}

	// 	if (isNaN(interpMapPlayersRep.value[player.steamId].rotation[0])) {
	// 		oldPos[player.steamId].rotation = [0, 0, 0];
	// 	}

	// 	// Position
	// 	if (interpMapPlayersRep.value[player.steamId].position !== player.position) {
	// 		const posArray = player.position;
	// 		oldPos[player.steamId].position = posArray.map(
	// 			(num, i) => (num - oldPos[player.steamId].position[i]) / 2 + oldPos[player.steamId].position[i],
	// 		);
	// 	}

	// 	// Rotation
	// 	if (interpMapPlayersRep.value[player.steamId].rotation !== player.rotation) {
	// 		const rotationArray = player.rotation;
	// 		oldPos[player.steamId].rotation = rotationArray.map(
	// 			(num, i) => (num - oldPos[player.steamId].rotation[i]) / 2 + oldPos[player.steamId].rotation[i],
	// 		);
	// 	}
	// });

	// interpMapPlayersRep.value = oldPos;
	// interpSteps++;

	const newInterp: { [key: string]: MapPlayerData } = {};
	playerBuffer.forEach((playersSet, i) => {
		if (clonedMapPlayers.length === 0) return;

		playersSet.unshift(clonedMapPlayers[i]);

		if (phaseRep.value.phase === 'freezetime' && !haveReset) {
			haveReset = true;
			playersSet = playersSet.slice(0, 1);
		} else {
			playersSet = playersSet.slice(0, NEW_INTERPOLATION_STEPS);
		}

		// This is way less code than averaging multiple arrays
		const avgX = playersSet.reduce((a, b) => a + b.position[0], 0) / playersSet.length;
		const avgY = playersSet.reduce((a, b) => a + b.position[1], 0) / playersSet.length;
		const avgZ = playersSet.reduce((a, b) => a + b.position[2], 0) / playersSet.length;
		const avgAngleX = playersSet.reduce((a, b) => a + b.rotation[0], 0) / playersSet.length;
		const avgAngleY = playersSet.reduce((a, b) => a + b.rotation[1], 0) / playersSet.length;

		newInterp[clonedMapPlayers[i].steamId] = {
			...clonedMapPlayers[i],
			position: [avgX, avgY, avgZ],
			rotation: [avgAngleX, avgAngleY, clonedMapPlayers[i].rotation[2]],
		}
	});

	interpMapPlayersRep.value = newInterp;

	// }, 45 / INTERPOLATION_STEPS);	// CSGO Msg rate 20Hz = 50ms, bit lower just in case

	if (phaseRep.value.phase === 'live' && haveReset) {
		haveReset = false;
	}
}, 20);

// setInterval(() => {
// 	console.log(playerBuffer);
// }, 500);
