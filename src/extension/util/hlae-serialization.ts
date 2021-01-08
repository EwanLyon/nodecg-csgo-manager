/* 
	Original code from: https://github.com/advancedfx/advancedfx/blob/main/misc/mirv_pgl_test/server.js
	Refactored to use JS Classes rather than prototypes and converted to typescript
*/
import bigInt from "big-integer";

function findDelim(buffer: Buffer, idx: number) {
	var delim = -1;
	for (var i = idx; i < buffer.length; ++i) {
		if (0 == buffer[i]) {
			delim = i;
			break;
		}
	}

	return delim;
}

export class BufferReader {
	buffer: Buffer;
	index: number;

	constructor(buffer: Buffer) {
		this.buffer = buffer;
		this.index = 0;
	}

	readBigUInt64LE() {

		const lo = this.readUInt32LE()
		const hi = this.readUInt32LE();

		return bigInt(lo).or(bigInt(hi).shiftLeft(32));
	};

	readUInt32LE() {
		var result = this.buffer.readUInt32LE(this.index);
		this.index += 4;

		return result;
	};

	readInt32LE() {
		var result = this.buffer.readInt32LE(this.index);
		this.index += 4;

		return result;
	};

	readInt16LE() {
		var result = this.buffer.readInt16LE(this.index);
		this.index += 2;

		return result;
	};

	readInt8() {
		var result = this.buffer.readInt8(this.index);
		this.index += 1;

		return result;
	};

	readUInt8() {
		var result = this.buffer.readUInt8(this.index);
		this.index += 1;

		return result;
	};

	readBoolean() {
		return 0 != this.readUInt8();
	};

	readFloatLE() {
		var result = this.buffer.readFloatLE(this.index);
		this.index += 4;

		return result;
	};

	readCString() {
		var delim = findDelim(this.buffer, this.index);
		if (this.index <= delim) {
			var result = this.buffer.toString('utf8', this.index, delim);
			this.index = delim + 1;

			return result;
		}

		throw "BufferReader.prototype.readCString";
	}

	eof() {
		return this.index >= this.buffer.length;
	}
}

interface GameEvent {
	name: string;
	clientTime: number;
	keys: Record<string, { name: string, type: number }>;
}

class GameEventDescription {
	eventId: number;
	eventName: string;
	keys: { name: string, type: number }[] = [];
	enrichments: Record<string, any> = {};

	constructor(bufferReader: BufferReader) {
		this.eventId = bufferReader.readInt32LE();
		this.eventName = bufferReader.readCString();

		while (bufferReader.readBoolean()) {
			const keyName = bufferReader.readCString();
			const keyType = bufferReader.readInt32LE();

			this.keys.push({
				name: keyName,
				type: keyType
			});
		}
	}

	unserialize(bufferReader: BufferReader): GameEvent {
		const clientTime = bufferReader.readFloatLE();

		const result: GameEvent = {
			name: this.eventName,
			clientTime: clientTime,
			keys: {}
		};

		for (let i = 0; i < this.keys.length; ++i) {
			const key = this.keys[i];

			const keyName = key.name;

			let keyValue;

			switch (key.type) {
				case 1:
					keyValue = bufferReader.readCString();
					break;
				case 2:
					keyValue = bufferReader.readFloatLE();
					break;
				case 3:
					keyValue = bufferReader.readInt32LE();
					break;
				case 4:
					keyValue = bufferReader.readInt16LE();
					break;
				case 5:
					keyValue = bufferReader.readInt8();
					break;
				case 6:
					keyValue = bufferReader.readBoolean();
					break;
				case 7:
					keyValue = bufferReader.readBigUInt64LE();
					break;
				default:
					throw "GameEventDescription.prototype.unserialize";
			}

			if (this.enrichments[keyName]) {
				keyValue = this.enrichments[keyName].unserialize(bufferReader, keyValue);
			}

			result.keys[key.name] = keyValue;
		}

		return result;
	}
}

export class UseridEnrichment {
	enrichments = ['useridWithSteamId', 'useridWithEyePosition', 'useridWithEyeAngles'];

	constructor() { }

	unserialize(bufferReader: BufferReader, keyValue: number) {
		const xuid = bufferReader.readBigUInt64LE().toString();
		const eyeOrigin = [bufferReader.readFloatLE(), bufferReader.readFloatLE(), bufferReader.readFloatLE()];
		const eyeAngles = [bufferReader.readFloatLE(), bufferReader.readFloatLE(), bufferReader.readFloatLE()];

		return {
			value: keyValue,
			xuid: xuid,
			eyeOrigin: eyeOrigin,
			eyeAngles: eyeAngles,
		};
	}
}

export class EntitynumEnrichment {
	enrichments = ['entnumWithOrigin', 'entnumWithAngles'];

	constructor() { }

	unserialize(bufferReader: BufferReader, keyValue: number) {
		var origin = [bufferReader.readFloatLE(), bufferReader.readFloatLE(), bufferReader.readFloatLE()];
		var angles = [bufferReader.readFloatLE(), bufferReader.readFloatLE(), bufferReader.readFloatLE()];

		return {
			value: keyValue,
			origin: origin,
			angles: angles,
		};
	}
}

export class GameEventUnserializer {
	enrichments: Record<string, any>;
	knownEvents: Record<string, any> = {};	// id -> description

	constructor(enrichments: Record<string, any>) {
		this.enrichments = enrichments;
	}

	unserialize(bufferReader: BufferReader) {
		const eventId = bufferReader.readInt32LE();
		let gameEvent;

		if (0 === eventId) {
			gameEvent = new GameEventDescription(bufferReader);
			this.knownEvents[gameEvent.eventId] = gameEvent;

			if (this.enrichments[gameEvent.eventName]) {
				gameEvent.enrichments = this.enrichments[gameEvent.eventName];
			}
		} else {
			gameEvent = this.knownEvents[eventId]
		};

		if (undefined === gameEvent) throw "GameEventUnserializer.prototype.unserialize";

		return gameEvent.unserialize(bufferReader);
	}
}

const useridEnrichment = new UseridEnrichment();
const entitynumEnrichment = new EntitynumEnrichment();

interface encrichmentTypes {
	[key: string]: {
		[key: string]: UseridEnrichment | EntitynumEnrichment
	}
}

// ( see https://wiki.alliedmods.net/Counter-Strike:_Global_Offensive_Events )
export const allEnrichments: encrichmentTypes = {
	'player_death': {
		'userid': useridEnrichment,
		'attacker': useridEnrichment,
		'assister': useridEnrichment,
	},
	'other_death': {
		'attacker': useridEnrichment,
	},
	'player_hurt': {
		'userid': useridEnrichment,
		'attacker': useridEnrichment,
	},
	'item_purchase': {
		'userid': useridEnrichment,
	},
	'bomb_beginplant': {
		'userid': useridEnrichment,
	},
	'bomb_abortplant': {
		'userid': useridEnrichment,
	},
	'bomb_planted': {
		'userid': useridEnrichment,
	},
	'bomb_defused': {
		'userid': useridEnrichment,
	},
	'bomb_exploded': {
		'userid': useridEnrichment,
	},
	'bomb_pickup': {
		'userid': useridEnrichment,
	},
	'bomb_dropped': {
		'userid': useridEnrichment,
		'entindex': entitynumEnrichment,
	},
	'defuser_dropped': {
		'entityid': entitynumEnrichment,
	},
	'defuser_pickup': {
		'entityid': entitynumEnrichment,
		'userid': useridEnrichment,
	},
	'bomb_begindefuse': {
		'userid': useridEnrichment,
	},
	'bomb_abortdefuse': {
		'userid': useridEnrichment,
	},
	'hostage_follows': {
		'userid': useridEnrichment,
		'hostage': entitynumEnrichment,
	},
	'hostage_hurt': {
		'userid': useridEnrichment,
		'hostage': entitynumEnrichment,
	},
	'hostage_killed': {
		'userid': useridEnrichment,
		'hostage': entitynumEnrichment,
	},
	'hostage_rescued': {
		'userid': useridEnrichment,
		'hostage': entitynumEnrichment,
	},
	'hostage_stops_following': {
		'userid': useridEnrichment,
		'hostage': entitynumEnrichment,
	},
	'hostage_call_for_help': {
		'hostage': entitynumEnrichment,
	},
	'vip_escaped': {
		'userid': useridEnrichment,
	},
	'player_radio': {
		'userid': useridEnrichment,
	},
	'bomb_beep': {
		'entindex': entitynumEnrichment,
	},
	'weapon_fire': {
		'userid': useridEnrichment,
	},
	'weapon_fire_on_empty': {
		'userid': useridEnrichment,
	},
	'grenade_thrown': {
		'userid': useridEnrichment,
	},
	'weapon_outofammo': {
		'userid': useridEnrichment,
	},
	'weapon_reload': {
		'userid': useridEnrichment,
	},
	'weapon_zoom': {
		'userid': useridEnrichment,
	},
	'silencer_detach': {
		'userid': useridEnrichment,
	},
	'inspect_weapon': {
		'userid': useridEnrichment,
	},
	'weapon_zoom_rifle': {
		'userid': useridEnrichment,
	},
	'player_spawned': {
		'userid': useridEnrichment,
	},
	'item_pickup': {
		'userid': useridEnrichment,
	},
	'item_pickup_failed': {
		'userid': useridEnrichment,
	},
	'item_remove': {
		'userid': useridEnrichment,
	},
	'ammo_pickup': {
		'userid': useridEnrichment,
		'index': entitynumEnrichment,
	},
	'item_equip': {
		'userid': useridEnrichment,
	},
	'enter_buyzone': {
		'userid': useridEnrichment,
	},
	'exit_buyzone': {
		'userid': useridEnrichment,
	},
	'enter_bombzone': {
		'userid': useridEnrichment,
	},
	'exit_bombzone': {
		'userid': useridEnrichment,
	},
	'enter_rescue_zone': {
		'userid': useridEnrichment,
	},
	'exit_rescue_zone': {
		'userid': useridEnrichment,
	},
	'silencer_off': {
		'userid': useridEnrichment,
	},
	'silencer_on': {
		'userid': useridEnrichment,
	},
	'buymenu_open': {
		'userid': useridEnrichment,
	},
	'buymenu_close': {
		'userid': useridEnrichment,
	},
	'round_end': {
		'winner': useridEnrichment,
	},
	'grenade_bounce': {
		'userid': useridEnrichment,
	},
	'hegrenade_detonate': {
		'userid': useridEnrichment,
	},
	'flashbang_detonate': {
		'userid': useridEnrichment,
	},
	'smokegrenade_detonate': {
		'userid': useridEnrichment,
	},
	'smokegrenade_expired': {
		'userid': useridEnrichment,
	},
	'molotov_detonate': {
		'userid': useridEnrichment,
	},
	'decoy_detonate': {
		'userid': useridEnrichment,
	},
	'decoy_started': {
		'userid': useridEnrichment,
	},
	'tagrenade_detonate': {
		'userid': useridEnrichment,
	},
	'decoy_firing': {
		'userid': useridEnrichment,
	},
	'bullet_impact': {
		'userid': useridEnrichment,
	},
	'player_footstep': {
		'userid': useridEnrichment,
	},
	'player_jump': {
		'userid': useridEnrichment,
	},
	'player_blind': {
		'userid': useridEnrichment,
		'entityid': entitynumEnrichment,
	},
	'player_falldamage': {
		'userid': useridEnrichment,
	},
	'door_moving': {
		'entityid': entitynumEnrichment,
		'userid': useridEnrichment,
	},
	'spec_target_updated': {
		'userid': useridEnrichment,
	},
	'player_avenged_teammate': {
		'avenger_id': useridEnrichment,
		'avenged_player_id': useridEnrichment,
	},
	'round_mvp': {
		'userid': useridEnrichment,
	},
	'player_decal': {
		'userid': useridEnrichment,
	},

	// ... left out the gg / gungame stuff, feel free to add it ...

	'player_reset_vote': {
		'userid': useridEnrichment,
	},
	'start_vote': {
		'userid': useridEnrichment,
	},
	'player_given_c4': {
		'userid': useridEnrichment,
	},
	'player_become_ghost': {
		'userid': useridEnrichment,
	},

	// ... left out the tr stuff, feel free to add it ...

	'jointeam_failed': {
		'userid': useridEnrichment,
	},
	'teamchange_pending': {
		'userid': useridEnrichment,
	},
	'ammo_refill': {
		'userid': useridEnrichment,
	},

	// ... left out the dangerzone stuff, feel free to add it ...

	// others:

	'weaponhud_selection': {
		'userid': useridEnrichment,
	},
};

export const basicEnrichments: encrichmentTypes = {
	'player_death': {
		'userid': useridEnrichment,
		'attacker': useridEnrichment,
		'assister': useridEnrichment,
	},
	'other_death': {
		'attacker': useridEnrichment,
	},
	'weapon_fire': {
		'userid': useridEnrichment,
	},
}
