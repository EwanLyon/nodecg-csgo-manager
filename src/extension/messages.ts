import * as nodecgApiContext from './util/nodecg-api-context';
const nodecg = nodecgApiContext.get();

import { CSGOOutput } from '../types/csgo-gsi';

// Sends messages based on game information
const gameRep = nodecg.Replicant<CSGOOutput>('gameRep');

gameRep.on('change', (newVal, oldVal) => {
	if (oldVal?.phaseCountdowns.phase !== newVal.phaseCountdowns.phase) {
		nodecg.sendMessage(`newPhase:${newVal.phaseCountdowns.phase}`);
	}

	if (oldVal?.bomb.state !== newVal.bomb.state) {
		nodecg.sendMessage(`newBomb:${newVal.bomb.state}`);
	}
});
