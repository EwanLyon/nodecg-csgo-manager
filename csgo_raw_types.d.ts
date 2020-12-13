export interface CSGOOutput {
    provider:        Provider;
    map:             Map;
    round:           Round;
    player:          CSGOOutputPlayer;
    allplayers:      { [key: string]: CSGOOutputAllplayer };
    phaseCountdowns: CSGOOutputPhaseCountdowns;
    grenades:        { [key: string]: CSGOOutputGrenade };
    bomb:            CSGOOutputBomb;
    previously:      Previously;
}

export interface CSGOOutputAllplayer {
    name:         string;
    observerSlot: number;
    team:         TeamEnum;
    state:        StateClass;
    matchStats:   MatchStats;
    weapons:      PurpleWeapons;
    position:     string;
    forward:      string;
    clan?:        string;
}

export interface MatchStats {
    kills:   number;
    assists: number;
    deaths:  number;
    mvps:    number;
    score:   number;
}

export interface StateClass {
    health:        number;
    armor:         number;
    helmet:        boolean;
    flashed:       number;
    burning:       number;
    money:         number;
    roundKills:    number;
    roundKillhs:   number;
    roundTotaldmg: number;
    equipValue:    number;
    defusekit?:    boolean;
    smoked?:       number;
}

export enum TeamEnum {
    CT = "CT",
    T = "T",
}

export interface PurpleWeapons {
    weapon0:  Weapon5_Class;
    weapon1:  Weapon1;
    weapon2?: Weapon2_Class;
    weapon3?: Weapon2_Class;
    weapon4?: Weapon2_Class;
    weapon5?: Weapon5_Class;
    weapon6?: Weapon5_Class;
}

export interface Weapon5_Class {
    name:         string;
    paintkit:     Paintkit;
    type:         Type;
    state:        StateEnum;
    ammoReserve?: number;
}

export enum Paintkit {
    AmDopplerPhase2 = "am_doppler_phase2",
    Default = "default",
    HyDdpat = "hy_ddpat",
    SPMeshTan = "sp_mesh_tan",
}

export enum StateEnum {
    Active = "active",
    Holstered = "holstered",
}

export enum Type {
    C4 = "C4",
    Grenade = "Grenade",
    Knife = "Knife",
    Pistol = "Pistol",
    Rifle = "Rifle",
    SniperRifle = "SniperRifle",
}

export interface Weapon1 {
    name:        string;
    paintkit:    string;
    type:        Type;
    ammoClip:    number;
    ammoClipMax: number;
    ammoReserve: number;
    state:       StateEnum;
}

export interface Weapon2_Class {
    name:         string;
    paintkit:     string;
    type:         Type;
    state:        StateEnum;
    ammoReserve?: number;
    ammoClip?:    number;
    ammoClipMax?: number;
}

export interface CSGOOutputBomb {
    state:    string;
    position: string;
    player:   number;
}

export interface CSGOOutputGrenade {
    owner:       number;
    position:    string;
    velocity:    string;
    lifetime:    string;
    type:        string;
    effecttime?: string;
}

export interface Map {
    mode:                  string;
    name:                  string;
    phase:                 string;
    round:                 number;
    teamCT:                Team;
    teamT:                 Team;
    numMatchesToWinSeries: number;
    currentSpectators:     number;
    souvenirsTotal:        number;
    roundWINS:             { [key: string]: RoundWin };
}

export enum RoundWin {
    CTWinDefuse = "ct_win_defuse",
    CTWinElimination = "ct_win_elimination",
    TWinElimination = "t_win_elimination",
}

export interface Team {
    score:                  number;
    consecutiveRoundLosses: number;
    timeoutsRemaining:      number;
    matchesWonThisSeries:   number;
}

export interface CSGOOutputPhaseCountdowns {
    phase:       string;
    phaseEndsIn: string;
}

export interface CSGOOutputPlayer {
    steamid:      string;
    clan:         string;
    name:         string;
    observerSlot: number;
    team:         TeamEnum;
    activity:     string;
    state:        StateClass;
    spectarget:   string;
    position:     string;
    forward:      string;
}

export interface Previously {
    player:          PreviouslyPlayer;
    allplayers:      { [key: string]: PreviouslyAllplayer };
    phaseCountdowns: PreviouslyPhaseCountdowns;
    grenades:        { [key: string]: PreviouslyGrenade };
    bomb:            PreviouslyBomb;
}

export interface PreviouslyAllplayer {
    position: string;
    forward:  string;
    weapons?: FluffyWeapons;
}

export interface FluffyWeapons {
    weapon0: PurpleWeapon;
    weapon3: PurpleWeapon;
}

export interface PurpleWeapon {
    state: StateEnum;
}

export interface PreviouslyBomb {
    position: string;
}

export interface PreviouslyGrenade {
    position: string;
    velocity: string;
    lifetime: string;
}

export interface PreviouslyPhaseCountdowns {
    phaseEndsIn: string;
}

export interface PreviouslyPlayer {
    position: string;
    forward:  string;
}

export interface Provider {
    name:      string;
    appid:     number;
    version:   number;
    steamid:   string;
    timestamp: number;
}

export interface Round {
    phase: string;
}
