import * as nodecgApiContext from './util/nodecg-api-context';
const nodecg = nodecgApiContext.get();

import { CSGO } from '../types/csgo-gsi';

// Sends messages based on game information
const gameRep = nodecg.Replicant<CSGO>('gameRep');

gameRep.on('change', (newVal, oldVal) => {
	if (oldVal?.phaseCountdowns.phase !== newVal.phaseCountdowns.phase) {
		nodecg.sendMessage(`newPhase:${newVal.phaseCountdowns.phase}`);
	}

	if (oldVal?.bomb.state !== newVal.bomb.state) {
		nodecg.sendMessage(`newBomb:${newVal.bomb.state}`);
	}
});
