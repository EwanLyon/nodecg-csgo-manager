'use-strict';

import { NodeCG } from 'nodecg/types/server';
import * as nodecgApiContext from './util/nodecg-api-context';
import { BundleStatus } from '../types/bundle-status';
import { bundleStatus, gameSettings } from './dummyData';
import { GameSettings } from '../types/game-settings';

async function init(): Promise<void> {
	const nodecg = nodecgApiContext.get();

	// @ts-ignore
	const bundleStatusRep = nodecg.Replicant<BundleStatus>('bundleStatus', {
		defaultValue: bundleStatus
	});
	// @ts-ignore
	const gameSettingsRep = nodecg.Replicant<GameSettings>('gameSettings', {
		defaultValue: gameSettings
	});

	require('./server');
	require('./team-import-export');
	require('./matches');
	require('./tournament');
	require('./map-interp');
	require('./hlae');
	require('./extraData');
}

module.exports = (nodecg: NodeCG): void => {
	nodecgApiContext.set(nodecg);

	init()
		.then(() => {
			nodecg.log.info('Initialization successful.');
		})
		.catch(error => {
			nodecg.log.error('Failed to initialize:', error);
		});
};
