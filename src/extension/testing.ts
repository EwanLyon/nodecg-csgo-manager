import * as nodecgApiContext from './util/nodecg-api-context';

// import { testData } from './testing-data/testing';
import { CSGO } from '../types/csgo-gsi';

// Testing data
import TestStandard from './testing-data/standard.json';

const nodecg = nodecgApiContext.get();

let dataIteration = 0;
let testInterval: NodeJS.Timeout;

nodecg.listenFor('test:standard', () => {
	runTest('standard');
});

nodecg.listenFor('test:stop', () => {
	clearInterval(testInterval);
});

function calculateUpdateRate(data: CSGO[]): number {
	let currentTimestamp = 0;
	let numberOfTimestamps = 0;
	const allTimes: number[] = [];

	data.forEach(packet => {
		if (currentTimestamp !== packet.provider.timestamp) {
			// console.log(`${currentTimestamp}: ${numberOfTimestamps}`);
			allTimes.push(numberOfTimestamps);
			currentTimestamp = packet.provider.timestamp;
			numberOfTimestamps = 1;
		} else {
			numberOfTimestamps++;
		}
	})

	return allTimes.reduce((a, b) => a + b, 0) / allTimes.length;
}

function runTest(type: string) {
	dataIteration = 0;
	let testingData: CSGO[];

	switch (type) {
		case 'standard':
			testingData = TestStandard as unknown as CSGO[];
			break;
	
		default:
			testingData = TestStandard as unknown as CSGO[];
			break;
	}

	if (!testingData) return;

	const dataRate = calculateUpdateRate(testingData);

	testInterval = setInterval(() => {
		if (dataIteration < testingData.length) {
			nodecg.sendMessage('sendTestData', testingData[dataIteration]);
			dataIteration++;
		} else {
			clearInterval(testInterval);
		}
	}, 1000 / dataRate);
}

