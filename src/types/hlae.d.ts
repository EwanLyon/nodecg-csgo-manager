export interface GameEvent {
    name: string;
    clientTime: number;
    keys: Object;
    round: number;
}

export interface PlayerDeath {
    name:       string;
    clientTime: number;
    keys:       PlayerDeathKeys;
    round: number;
}

interface PlayerDeathKeys {
    userid:                  Assister;
    attacker:                Assister;
    assister:                Assister;
    assistedflash:           boolean;
    weapon:                  string;
    weaponItemid:            string;
    weaponFauxitemid:        string;
    weaponOriginalownerXuid: string;
    headshot:                boolean;
    dominated:               number;
    revenge:                 number;
    wipe:                    number;
    penetrated:              number;
    noreplay:                boolean;
    noscope:                 boolean;
    thrusmoke:               boolean;
    attackerblind:           boolean;
}

interface Assister {
    value:     number;
    xuid:      string;
    eyeOrigin: number[];
    eyeAngles: number[];
}
