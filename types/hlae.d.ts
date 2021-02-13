export interface GameEvent {
	name: string;
	clientTime: number;
	keys: Record<string, unknown>;
	round: number;
}

export interface PlayerDeath {
	name: string;
	clientTime: number;
	keys: PlayerDeathKeys;
	round: number;
}

interface PlayerDeathKeys {
	userid: Userid;
	attacker: Userid;
	assister: Userid;
	assistedflash: boolean;
	weapon: string;
	weaponItemid: string;
	weaponFauxitemid: string;
	weaponOriginalownerXuid: string;
	headshot: boolean;
	dominated: number;
	revenge: number;
	wipe: number;
	penetrated: number;
	noreplay: boolean;
	noscope: boolean;
	thrusmoke: boolean;
	attackerblind: boolean;
	distance: number;
}

export interface WeaponFire {
    name:       string;
    clientTime: number;
    keys:       WeaponFireKeys;
    round:      number;
}

export interface WeaponFireKeys {
    userid:   Userid;
    weapon:   string;
    silenced: boolean;
}

export interface Userid {
    value:     number;
    xuid:      string;
    eyeOrigin: number[];
    eyeAngles: number[];
}
