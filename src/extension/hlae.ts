import * as nodecgApiContext from './util/nodecg-api-context';
const nodecg = nodecgApiContext.get();
import Websocket from 'ws';

import { PlayerDeath } from '../types/hlae';
import { Map } from '../types/csgo-gsi';

import { BufferReader, GameEventUnserializer, basicEnrichments } from './util/hlae-serialization';

// The local host may need to be changed to the host url like in the csgo thing
const wss = new Websocket.Server({ port: 31337 });

const hlaeActiveRep = nodecg.Replicant<boolean>('hlaeActive');
const matchKillsRep = nodecg.Replicant<PlayerDeath[]>('matchKills');
const mapRep = nodecg.Replicant<Map>('matchStats');

wss.on('error', error => {
	nodecg.log.error('HLAE Websocket error: ' + error);
	hlaeActiveRep.value = false;
});

wss.on('close', () => {
	nodecg.log.warn(`HLAE Websocket closed`);
	hlaeActiveRep.value = false;
});

wss.on('connection', (ws) => {
	const gameEventUnserializer = new GameEventUnserializer(basicEnrichments);

	ws.on('message', (data) => {
		if (data instanceof Buffer) {
			const bufferReader = new BufferReader(Buffer.from(data));

			try {
				while (!bufferReader.eof()) {
					const cmd = bufferReader.readCString();
					// console.log(cmd);

					switch (cmd) {
						case 'hello':
							{
								const version = bufferReader.readUInt32LE();
								// console.log('version = ' + version);
								if (2 != version) throw "Error: version mismatch";

								ws.send(new Uint8Array(Buffer.from('transBegin\0', 'utf8')), { binary: true });

								ws.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enrich clientTime 1\0', 'utf8')), { binary: true });

								for (const eventName in basicEnrichments) {
									for (const keyName in basicEnrichments[eventName]) {
										const arrEnrich = basicEnrichments[eventName][keyName].enrichments;

										for (let i = 0; i < arrEnrich.length; ++i) {
											ws.send(new Uint8Array(Buffer.from(`exec\0mirv_pgl events enrich eventProperty "${arrEnrich[i]}" "${eventName}" "${keyName}"\0`, 'utf8')), { binary: true });
										}
									}
								}

								ws.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enabled 1\0', 'utf8')), { binary: true });

								ws.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events useCache 1\0', 'utf8')), { binary: true });

								ws.send(new Uint8Array(Buffer.from('transEnd\0', 'utf8')), { binary: true });

								hlaeActiveRep.value = true;
								nodecg.log.info('HLAE Websocket open');
							}
							break;
						case 'dataStart':
							break;
						case 'dataStop':
							break;
						case 'levelInit':
							{
								const map = bufferReader.readCString();
								console.log('map = ' + map);
							}
							break;
						case 'levelShutdown':
							break;
						case 'cam':
							{
								const time = bufferReader.readFloatLE();
								console.log('time = ' + time);
								const xPosition = bufferReader.readFloatLE();
								console.log('xPosition = ' + xPosition);
								const yPosition = bufferReader.readFloatLE();
								console.log('yPosition = ' + yPosition);
								const zPosition = bufferReader.readFloatLE();
								console.log('zPosition = ' + zPosition);
								const xRotation = bufferReader.readFloatLE();
								console.log('xRotation = ' + xRotation);
								const yRotation = bufferReader.readFloatLE();
								console.log('yRotation = ' + yRotation);
								const zRotation = bufferReader.readFloatLE();
								console.log('zRotation = ' + zRotation);
								const fov = bufferReader.readFloatLE();
								console.log('fov = ' + fov);
							}
							break;
						case 'gameEvent':
							{
								const gameEvent = gameEventUnserializer.unserialize(bufferReader);
								gameEventHandler(gameEvent);
								// console.log(JSON.stringify(gameEvent));
							}
							break;
						default:
							throw "Error: unknown message";
					}
				}
			}
			catch (err) {
				console.log(`Error: ${err.toString()} at ${bufferReader.index}.`);
			}
		}
	});
});

function gameEventHandler(rawGameEvent: any) {
	const gameEvent = JSON.parse(JSON.stringify(rawGameEvent));
	gameEvent.round = mapRep.value.round;

	switch (gameEvent.name as string) {
		case "player_death":
			nodecg.sendMessage('hlae-playerDeath', gameEvent);
			matchKillsRep.value.push(gameEvent);
			break;
		case "weapon_fire":
			nodecg.sendMessage('hlae-weaponFire', gameEvent);
			break;
		default:
			break;
	}
}

nodecg.listenFor('resetMatchKills', () => {
	matchKillsRep.value = [];
});

// Player death
// {
// 	"name": "player_death",
// 	"clientTime": 192.328125,
// 	"keys": {
// 		"userid": {
// 			"value": 6,
// 			"xuid": "76561198047622759",
// 			"eyeOrigin": [-1173.621337890625,
// 			-523.5558471679688,
// 			-103.96875],
// 			"eyeAngles": [0.8682631850242615,
// 				-9.43055534362793,
// 				-0.0004880477499682456]
// 		},
// 		"attacker": {
// 			"value": 7,
// 			"xuid": "76561198132024641",
// 			"eyeOrigin": [470.0711669921875,
// 				-502.67236328125,
// 				-95.96875],
// 			"eyeAngles": [0.5822755098342896,
// 				-173.38682556152344,
// 				0.00023623071319889277]
// 		},
// 		"assister": {
// 			"value": 0,
// 			"xuid": "0",
// 			"eyeOrigin": [0,
// 				0,
// 				0],
// 			"eyeAngles": [0,
// 				0,
// 				0]
// 		},
// 		"assistedflash": false,
// 		"weapon": "ssg08",
// 		"weapon_itemid": "4546691908",
// 		"weapon_fauxitemid": "17293822569106636840",
// 		"weapon_originalowner_xuid": "76561198132024641",
// 		"headshot": true,
// 		"dominated": 0,
// 		"revenge": 0,
// 		"wipe": 0,
// 		"penetrated": 1,
// 		"noreplay": false,
// 		"noscope": false,
// 		"thrusmoke": false,
// 		"attackerblind": false
// 	}
// }
