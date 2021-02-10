# API Documentation: Replicants

_[Link to NodeCG documentation for reference.](https://www.nodecg.dev/docs/classes/replicant)_

[Usage](#usage)

CSGO Data

- [game](#game)
- [matchStats](#matchStats)
- [allPlayers](#allPlayers)
- [observingPlayer](#observingPlayer)
- [bomb](#bomb)
- [phase](#phase)
- [mapGrenades](#mapGrenades)
- [mapPlayers](#mapPlayers)
- [teamOne / teamTwo](#teamOne)
- [round30Winner](#round30Winner)
- [playerData](#playerData)

HLAE

- [hlaeActive](#hlaeActive)
- [matchKills](#matchKills)

Map data

- [interpMapPlayers (Smoothed)](#interpMapPlayers)

Matches

- [matches](#matches)
- [currentMatch](#currentMatch)

Tournaments

- [tournaments](#tournaments)
- [currentTournament](#currentTournament)

Team/Player assets

- [teamPlayerPreset](#teamPlayerPreset)

Bundle Data/Settings

- [serverRate](#serverRate)
- [bundleStatus](#bundleStatus)
- [gameSettings](#gameSettings)

## Usage

Example code

```javascript
const csgoReplicant = nodecg.Replicant('game', 'nodecg-csgo-manager');

csgoReplicant.on('change', (newVal, oldVal) => {
  ...
});
```

## CSGO

## game

_Types available in [./src/types/csgo-gsi.d.ts](../src/types/csgo-gsi.d.ts)_

### Data

- `object`

Each property inside the game object is detailed in replicants below

### Example data

Go to [csgo-example.json](./csgo-example.json)

This the raw untouched value that is obtained from the CSGO Game State Integration.

## matchStats

_Types available in [./src/types/csgo-gsi.d.ts](../src/types/csgo-gsi.d.ts)_

### Data

- `object`
  - `mode` [string] Type of match the game is. Most likely "competitive".
  - `name` [string] Map name
  - `phase` [string] Phase the match is in
  - `round` [number] Current round
  - `team_ct` [object] Counter Terrorists
    - `score` [number] Team score
    - `consecutive_round_losses` [number] Amount of rounds lost in a row. Used for loss bonus
    - `timeouts_remaining` [number] Amount of timeouts the team has remaining
    - `matches_won_this_series` [number] Matches won for this series
  - `team_ct` [object] Terrorists
    - Same as `team_ct`
  - `num_matches_to_win_series` [number] Matches need to win. Would dictate Bo3 or Bo5, etc.
  - `current_spectators` [number] Number of people spectating the game
  - `souvenirs_total` [number] Souvenirs given out in the current match
  - `round_wins` [key value pair]
    - `key` [string] of round number
    - `value` How the round was won ("ct_win_defuse", "ct_win_time", "ct_win_elimination", "t_win_elimination", "t_win_bomb")

### Example data

```JSON
{
  "mode": "competitive",
  "name": "de_dust2",
  "phase": "live",
  "round": 4,
  "team_ct": {
    "score": 0,
    "consecutive_round_losses": 5,
    "timeouts_remaining": 1,
    "matches_won_this_series": 0
  },
  "team_t": {
    "score": 4,
    "consecutive_round_losses": 0,
    "timeouts_remaining": 1,
    "matches_won_this_series": 0
  },
  "num_matches_to_win_series": 0,
  "current_spectators": 0,
  "souvenirs_total": 0,
  "round_wins": {
    "1": "t_win_bomb",
    "2": "t_win_bomb",
    "3": "t_win_elimination",
    "4": "t_win_elimination"
  }
}
```

The map property of the raw CSGO Game State Integration.

## allPlayers

Array of all players from the `allplayers` property. Made into an array with a new steamId property and if observer slot is 0 it is changed to 10.

_Types available in [./src/types/csgo-gsi.d.ts](../src/types/csgo-gsi.d.ts)_

### Data

- `array`
  - `object`
    - `steamid` [string] Steam ID of the player
    - `name` [string] Name of the player
    - `observer_slot` [number] 0-9 of the observer ID
    - `team` [string] Which side the player is on ("T" or "CT")
    - `activity` [string] What the player is currently doing
    - `position`[string] X, Y and Z location of player
    - `rotation`[string] X, Y and Z rotation of player
    - `match_stats` [object] Information about the player's total match statistics
      - `kills` [number] Number of kills
      - `assists` [number] Number of assists
      - `deaths` [number] Number of deaths
      - `mvps` [number] Number of MVPs
      - `score` [number] Total score
    - `weapons` [object] Dictionary of weapons the player has
      - `string` Key ID of weapon ("weapon_0", "weapon_1")
        - `name` [string] Name of weapon
        - `paintkit` [string] Weapon skin
        - `type` [string] Type of weapon, ("C4", "Grenade", "Knife", "Pistol", "Rifle", "SniperRifle", "Shotgun", "Submachine Gun", "Machine gun")
        - `state` [string] If weapon is being held or not ("active", "holstered")
        - `ammo_clip` Amount of ammo currently in the gun
        - `ammo_clip_max` Amount of ammo the gun can have per clip
        - `ammo_reserve` Amount of ammo the player has left
    - `state` Player game data
      - `health` [number] Player's health
      - `armor` [number] Amount of armour left
      - `helmet` [boolean] If armour has a helmet
      - `flashed`  [number] If player is flashed. (Unknown if 0-1 or a percentage)
      - `smoked` [number] If player is in smoke. (Unknown if 0-1 or a percentage)
      - `burning` [number] If a player is burning. (Unknown if 0-1 or a percentage)
      - `money` [number] Amount of money the player has
      - `round_kills` [number] Number of kills this round
      - `round_killhs` [number] Number of kill this round that have been headshots
      - `round_totaldmg` [number] Total damage done this round
      - `equip_value` [number] Value of equipment

### Example data

```JSON
[
  {
    "name": "Kyle",
    "steamId": "76561197960265729",
    "observer_slot": 10,
    "team": "CT",
    "state": {
      "health": 100,
      "armor": 100,
      "helmet": true,
      "flashed": 0,
      "burning": 0,
      "money": 550,
      "round_kills": 0,
      "round_killhs": 0,
      "round_totaldmg": 0,
      "equip_value": 3400
    },
    "match_stats": {
      "kills": 1,
      "assists": 1,
      "deaths": 4,
      "mvps": 0,
      "score": 3
    },
    "weapons": {
      "weapon_0": {
        "name": "weapon_knife",
        "paintkit": "default",
        "type": "Knife",
        "state": "holstered"
      },
      "weapon_1": {
        "name": "weapon_deagle",
        "paintkit": "default",
        "type": "Pistol",
        "ammo_clip": 7,
        "ammo_clip_max": 7,
        "ammo_reserve": 35,
        "state": "holstered"
      },
      "weapon_2": {
        "name": "weapon_ssg08",
        "paintkit": "default",
        "type": "SniperRifle",
        "ammo_clip": 10,
        "ammo_clip_max": 10,
        "ammo_reserve": 90,
        "state": "active"
      }
    },
    "position": "-362.59, 1605.67, -126.91",
    "forward": "-0.60, 0.79, -0.10"
  }
]
```

## observingPlayer

Data of the observed player

_Types available in [./src/types/csgo-gsi.d.ts](../src/types/csgo-gsi.d.ts)_

### Data

- `object | undefined`
  - `steamid` [string] Steam ID of the player
  - `name` [string] Name of the player
  - `observer_slot` [number] 0-9 of the observer ID
  - `team` [string] Which side the player is on ("T" or "CT")
  - `activity` [string] What the player is currently doing
  - `state` Player game data
    - `health` [number] Player's health
    - `armor` [number] Amount of armour left
    - `helmet` [boolean] If armour has a helmet
    - `flashed`  [number] If player is flashed. (Unknown if 0-1 or a percentage)
    - `smoked` [number] If player is in smoke. (Unknown if 0-1 or a percentage)
    - `burning` [number] If a player is burning. (Unknown if 0-1 or a percentage)
    - `money` [number] Amount of money the player has
    - `round_kills` [number] Number of kills this round
    - `round_killhs` [number] Number of kill this round that have been headshots
    - `round_totaldmg` [number] Total damage done this round
    - `equip_value` [number] Value of equipment

### Example data

```JSON
{
  "steamid": "76561197960265735",
  "name": "Crusher",
  "observer_slot": 0,
  "team": "T",
  "activity": "playing",
  "state": {
    "health": 100,
    "armor": 100,
    "helmet": true,
    "flashed": 0,
    "smoked": 0,
    "burning": 0,
    "money": 8000,
    "round_kills": 0,
    "round_killhs": 0,
    "round_totaldmg": 0,
    "equip_value": 3600
  }
}
```

## bomb

Status of the bomb, whether it is dropped, being carried or planted.

_Types available in [./src/types/csgo-gsi.d.ts](../src/types/csgo-gsi.d.ts)_

### Data

- `object`
  - `state` [string] What state the bomb is currently in. ("planted". "exploded", "carried", "planting", "dropped", "defusing", "defused")
  - `position` [string] X, Y and Z location of the bomb
  - `player` [string] Player currently carrying or defusing the bomb
  - `countdown` [string] Bomb countdown

### Example data

```JSON
{
  "state": "carried",
  "position": "-403.47, 473.20, -4.72",
  "player": "76561197960265732"
}
```

## phase

What state the game is currently in.

_Types available in [./src/types/csgo-gsi.d.ts](../src/types/csgo-gsi.d.ts)_

### Data

- `object`
  - `phase` [string] What phase the game is in ("live", "bomb", "over", "freezetime", "paused", "defuse", "timeout_t", "timeout_ct", "warmup")
  - `phase_ends_in` [string] How long the phase will last

### Example data

```JSON
{
  "phase": "live",
  "phase_ends_in": "105.8"
}
```

## mapGrenades

List of all grenades that are active. Incendiary and Molotovs are called `firebomb` and each flame is sent as a grenade.

_Types available in [./src/types/csgo-gsi.d.ts](../src/types/csgo-gsi.d.ts)_

### Data

- `object`
  - `string` Key of grenade ID (each grenade has a unique ID)
    - `owner` [string] Steam ID of player that threw the grenade
    - `position` [string] X, Y and Z location of grenade
    - `velocity` [string] Speed of grenade?
    - `lifetime` [string] How long the grenade has existed
    - `type` [string] Type of grenade

### Example data

```JSON
{
  "765": {
    "owner": "76561197960265732",
    "position": "-220.44, 245.03, -2.44",
    "velocity": "-583.21, 491.35, -120.78",
    "lifetime": "1.4",
    "type": "smoke"
  }
}
```

## mapPlayers

A cleaned object showing only the necessary information needed to place a player on a mini map. **NOT INTERPRETED, Will be stuttery**.

_Types available in [./src/types/csgo-gsi.d.ts](../src/types/csgo-gsi.d.ts)_

### Data

- `array`
  - `object`
    - `steamId` [string] Player's Steam ID
    - `position`[number[3]] X, Y and Z location of player
    - `rotation`[number[3]] X, Y and Z rotation of player
    - `ct` [boolean] True if the player is a CT
    - `beingObserved` True if the player is the one being observed
    - `observerSlot` The observer ID the player is. *Normally 0-9 but has been converted to 1-10 as the 0th player is on the wrong "side"*
    - `health` The player's health. Mostly used to see if the player is dead.

### Example data

```JSON
[
  {
    "steamId": "76561197960265730",
    "position": [898.85,2123.59,-20.88],
    "rotation": [0.7,0.71,-0.1],
    "ct": false,
    "beingObserved": false,
    "observerSlot": 7,
    "health": 100
  }
]
```

## teamOne / teamTwo

_Types available in [./src/types/extra-data.d.ts](../src/types/extra-data.d.ts)_

### Data

- `object`
  - `equipmentValue` [number] Total value of all equipment for a team
  - `totalMoney` [number] Total amount of money for a team
  - `grenades` Total grenades for a team
    - `he` [number] Total frag grenades for the team
    - `flash` [number] Total flashbangs for the team
    - `smoke` [number] Total smoke grenades for the team
    - `fire` [number] Total incendiary and molotovs for the team
    - `decoy` [number] Total decoy grenades for the team
  - `players` [string[]] Array of player Steam IDs
  - `score` [number] Current score of team
  - `consecutiveRoundLosses` [number] Number of losses to dictate the loss bonus. (From CSGO GSI)
  - `matchesWonThisSeries` [number] Amount of matches won in the series. (From CSGO GSI)

### Example data

```JSON
{
  "equipmentValue": 19450,
  "totalMoney": 15200,
  "grenades": {
    "he": 0,
    "flash": 0,
    "smoke": 0,
    "fire": 0,
    "decoy": 0
  },
  "players": ["2", "76561197960265730", "76561197960265732", "76561197960265734", "76561197960265735"],
  "score": 4,
  "consecutiveRoundLosses": 0,
  "matchesWonThisSeries": 0
}
```

teamOne is the team who is the terrorists in the first half.
teamTwo is the team who is the counter-terrorists in the first half.

## playerData

Extra player data including game data and steam profile data information not given by CSGO.

_Types available in [./src/types/extra-data.d.ts](../src/types/extra-data.d.ts)_

### Data

- `object`
  - `totalDamage` [number] Damage done the entire round so far. Calculated by adding the total round damage at the end of each round.
  - `adr` [number] Average Damager per Round. Calculated by taking the `totalDamage` and dividing it by the number of rounds.
  - `name` [string] Player name
  - `image` [string] URL of Steam profile picture
  - `country` [string] Emoji of player's country

### Example data

```JSON
{
  "76561197960265729": {
    "totalDamage": 0,
    "adr": 0,
    "image": "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/32/32dbb7d95395f12254ba2d97ff56526a5d6989eb_full.jpg",
    "name": "Rich",
    "country": ""
  }
}
```

## round30Winner

Intended for internal use.
Due to a bug round wins after round 29 are not logged. This causes an off by one error in the overtime rounds calculator because of round 30. This will record who won round 30 for the internal calulation. It does not log how the round was won only who won it.

### Data

- `string` "T" or "CT"

### Example data

```JSON
"CT"
```

## HLAE

## hlaeActive

### Data

If HLAE is active/connected or not.

- `boolean` True if HLAE is connected

### Example data

```JSON
false
```

## matchKills

Array of all deaths made in match. Taken raw from HLAE events so some values I may not understand what they represent (Will be designated as "Unknown?").

_Types available in [./src/types/hlae.d.ts](../src/types/hlae.d.ts)_

### Data

- `[object]`Array
  - `name` [number] Event type *(should always be "player_death")*
  - `clientTime` [number] Unknown?
  - `round` [number] Which round the death took place in
  - `keys`
    - `assistedflash` [boolean] If the assister was because of a flashbang
    - `weapon` [string] The weapon/item used to kill the played
    - `weapon_id` [string] Unknown?
    - `weapon_fauxitemid` [string] Unknown?
    - `weapon_originalowner_xuid` [string] Unknown? (Assume this is if the player picks up a weapon from another player)
    - `headshot` [boolean] True if kill was a head shot
    - `dominated` [number] 0 or 1. 1 if kill was a domination
    - `revenge` [number] 0 or 1. 1 if kill was a revenge kill
    - `wipe` [number] 0 or 1. Unknown?
    - `penetrated` [number] 0 or 1. 1 if kill was a wallbang
    - `noscope`[boolean] True if kill was a noscope
    - `thrusmoke`[boolean] True if kill was through a smoke
    - `attackerblind`[boolean] True if attacker killed while blind/flashed
    - `distance`[number] Distance between attacker and player
    - `noreplay` [boolean] Unknown? (Possibly kills in deathmatch where a player can watch a reply of the kill)
    - `userid` Player that has died
      - `value`[number] Unknown?
      - `xuid` [string] Player Steam ID
      - `eyeOrigin` [number[3]] Unknown?
      - `eyeAngles` [number[3]] Unknown?
    - `attacker` Player that has killed the other player
      - `value`[number] Unknown?
      - `xuid` [string] Player Steam ID
      - `eyeOrigin` [number[3]] Unknown?
      - `eyeAngles` [number[3]] Unknown?
    - `assister` Player that has assisted in the kill
      - `value`[number] Unknown?
      - `xuid` [string] Player Steam ID
      - `eyeOrigin` [number[3]] Unknown?
      - `eyeAngles` [number[3]] Unknown?

### Example data

```JSON
[
  {
    "name": "player_death",
    "clientTime": 168.671875,
    "keys": {
      "userid": {
        "value": 4,
        "xuid": "0",
        "eyeOrigin": [-373.6505126953125, 1573.7967529296875, -62.60200500488281],
        "eyeAngles": [355.6109619140625, 260.3814697265625, 0]},
      "attacker": {
        "value": 5,
        "xuid": "0",
        "eyeOrigin": [-407.38153076171875, 122.61137390136719, 65.26649475097656],
        "eyeAngles": [6.102906227111816, 88.37369537353516, -2.1465999111569545e-7]
      },
      "assister": {
        "value": 0,
        "xuid": "0",
        "eyeOrigin": [0, 0, 0],
        "eyeAngles": [0, 0, 0]
      },
      "assistedflash": false,
      "weapon": "ak47",
      "weapon_itemid": "0",
      "weapon_fauxitemid": "17293822569102704647",
      "weapon_originalowner_xuid": "0",
      "headshot": false,
      "dominated": 0,
      "revenge": 0,
      "wipe": 0,
      "penetrated": 0,
      "noreplay": true,
      "noscope": false,
      "thrusmoke": false,
      "attackerblind": false,
      "distance": 36.895103454589844
    },
    "round": 1
  }
]
```

## Map Data

## interpMapPlayers

Similar to mapPlayers but the position and rotation are smoothed as the raw values are choppy.

_Types available in [./src/types/map-player.d.ts](../src/types/map-player.d.ts)_

### Data

- `object`
  - `string` Key of player's Steam ID
    - `steamId` [string] Player's Steam ID
    - `position`[number[3]] X, Y and Z location of player
    - `rotation`[number[3]] X, Y and Z rotation of player
    - `ct` [boolean] True if the player is a CT
    - `beingObserved` True if the player is the one being observed
    - `observerSlot` The observer ID the player is. *Normally 0-9 but has been converted to 1-10 as the 0th player is on the wrong "side"*
    - `health` The player's health. Mostly used to see if the player is dead.

### Example data

```JSON
{
  "76561197960265732": {
    "steamId": "76561197960265732",
    "position": [1312.1199999999997, 2460.68, 53.58],
    "rotation": [0.7999999999999999, -0.54, -0.27],
    "ct": false,
    "beingObserved": false,
    "observerSlot": 8,
    "health": 91
  }
}
```

## matches

All matches scheduled, the vetos and final score.

_Types available in [./src/types/matches.d.ts](../src/types/matches.d.ts)_

### Data

- `[object]` Array of Match objects
  - `id` [string] UUID of match
  - `status` [string] Custom match status information (e.g. "Coming Up", "Half Time", "Technical Pause")
  - `time` [string] What time the match will be played
  - `matchType` [string] How many matches are being played (e.g. "bo1", "bo3", "bo5")
  - `teamA` Dictated by which team is selected first in the schedule
    - `name` [string]  Full team name
    - `logo` [string]  URL of logo
    - `alias` [string]  Shorthand form of team name
  - `teamB` Dictated by which team is selected second in the schedule
    - `name` [string]  Full team name
    - `logo` [string]  URL of logo
    - `alias` [string]  Shorthand form of team name
  - `maps` [Array] Array of all maps veto'd and map scores
    - `map` [string] Map name
    - `teamVeto` [string] Team name that has selected the map
    - `ban` [boolean] True if the map was chosen to be banned
    - `side` [string] Which side the other team will choose to start
    - `complete` [boolean] True if the match has been finished
    - `roundWins` [string[]] String array of how rounds 1 to 29 was won. Taken from CSGO game state integration. *Not beyond round 29 because GSI does not provide that data.*
    - `totalScore` Final score of the map
      - `teamA` [number] TeamA's score
      - `teamB` [number]  TeamB's score
    - `firstHalf` Score for the first half
      - `teamA`[number] TeamA's score
      - `teamB`[number] TeamB's score
    - `secondHalf`Score for the second half
      - `teamA`[number] TeamA's score
      - `teamB`[number] TeamB's score
    - `ot` Score from an over time
      - `teamA`[number] TeamA's score
      - `teamB`[number] TeamB's score

### Example data

```JSON
[
  {
    "id": "b80a717b-2f58-4d5b-87a1-9b802303e2f3",
    "maps": [{
      "map": "Dust2",
      "ban": false,
      "teamVeto": "Avangar",
      "complete": true,
      "roundWins": [],
      "totalScore": {
        "teamA": 0,
        "teamB": 0
      },
      "firstHalf": {
        "teamA": 10,
        "teamB": 5
      },
      "secondHalf": {
        "teamA": 6,
        "teamB": 2
      },
      "side": "CT"
    },
    {
      "map": "Inferno",
      "ban": false,
      "teamVeto": "Astralis",
      "complete": false,
      "roundWins": [],
      "totalScore": {
        "teamA": 0,
        "teamB": 0
      },
      "firstHalf": {
        "teamA": 0,
        "teamB": 0
      },
      "secondHalf": {
        "teamA": 0,
        "teamB": 0
      },
      "side": "T"
    }],
    "status": "Soon",
    "time": "12:00",
    "matchType": "bo3",
    "teamA": {
      "alias": "Avangar",
      "name": "Avangar",
      "logo": "/assets/nodecg-csgo-manager/teamimages/8e89ldxOWak25k-LB7oYH3.svg"
    },
    "teamB": {
      "alias": "Astralis",
      "name": "Astralis",
      "logo": "/assets/nodecg-csgo-manager/teamimages/9bgXHp-oh1oaXr7F0mTGmd.svg"
    }
  }
]
```

## currentMatch

The current match being played. Undefined if no match.

_Types available in [./src/types/matches.d.ts](../src/types/matches.d.ts)_

### Data

- `object | undefined`: Match | undefined *(same as the object of [Matches](#matches)*)

### Example data

```JSON
{
  "id": "b80a717b-2f58-4d5b-87a1-9b802303e2f3",
  "maps": [
      {
      "map": "Dust2",
      "ban": false,
      "teamVeto": "Avangar",
      "complete": true,
      "roundWins": [],
      "totalScore": {
        "teamA": 0,
        "teamB": 0
      },
      "firstHalf": {
        "teamA": 10,
        "teamB": 5
      },
      "secondHalf": {
        "teamA": 6,
        "teamB": 2
      },
      "side": "CT"
    },
    {
      "map": "Inferno",
      "ban": false,
      "teamVeto": "Astralis",
      "complete": false,
      "roundWins": [],
      "totalScore": {
        "teamA": 0,
        "teamB": 0
      },
      "firstHalf": {
        "teamA": 0,
        "teamB": 0
      },
      "secondHalf": {
        "teamA": 0,
        "teamB": 0
      },
      "side": "T"
    }
  ],
  "status": "Soon",
  "time": "12:00",
  "matchType": "bo3",
  "teamA": {
    "alias": "Avangar",
    "name": "Avangar",
    "logo": "/assets/nodecg-csgo-manager/teamimages/8e89ldxOWak25k-LB7oYH3.svg"
  },
  "teamB": {
    "alias": "Astralis",
    "name": "Astralis",
    "logo": "/assets/nodecg-csgo-manager/teamimages/9bgXHp-oh1oaXr7F0mTGmd.svg"
  }
}
```

## Team/Player assets

## teamPlayerPreset

Data on all imported team and player information.

_Types available in [./src/types/team-preset.d.ts](../src/types/team-preset.d.ts)_

### Data

- `object`
  - `teams` Dictionary that holds all team meta data
    - `string` Key using team name
      - `name` [string]  Full team name
      - `logo` [string]  URL of logo
      - `alias` [string]  Shorthand form of team name
  - `players` Dictionary that holds all player meta data
    - `string` Key using steam id
      - `steamId` [string] Steam ID of player
      - `realName` [string] Player's real name
      - `country` [string] Emoji of player flag
      - `profilePicture` [string] URL of profile picture
      - `teamName` [string] Team name the player belongs to

### Example data

```JSON
{
  "teams": {
    "Astralis": {
      "alias": "Astralis",
       "name": "Astralis",
       "logo": "/assets/nodecg-csgo-manager/teamimages/9bgXHp-oh1oaXr7F0mTGmd.svg" 
    },
  },
  "players": {
    "76561198046005090": { 
      "steamId": "76561198046005090",
      "realName": "Ewan Lyon",
      "country": "🇦🇺",
      "profilePicture": "/assets/nodecg-csgo-manager/playerIcons/Final_x500.png"
    }
  }
}
```

## Tournaments

## tournaments

Dictionary of all tournaments.

_Types available in [./src/types/tournament.d.ts](../src/types/tournament.d.ts)_

### Data

- `object`
  - `string` Key UUID for the tournament
    - `id` [string] UUID for the tournament
    - `logo` [string] URL for the tournament logo
    - `name` [string] Name of the tournament
    - `active` [boolean] If the tournament is the current one
    - `fixture` [SingleElimination | DoubleElimination]

#### Single Elimination

- `type` [string] What tournament type the fixture is *(Should always be "single-elimination")*
- `matches` [string\[]\[]] Array of string arrays to hold match ids. First depth array is rounds and inside rounds are the individual matches

#### Double Elimination

- `type` [string] What tournament type the fixture is *(Should always be "double-elimination")*
- `winnerMatches` [string\[]\[]] Array of string arrays to hold winner bracket match ids. First depth array is rounds and inside rounds are the individual matches
- `loserMatches` [string\[]\[]] Array of string arrays to hold loser bracket match ids. First depth array is rounds and inside rounds are the individual matches

### Example data

```JSON
{
  "790e8b53-1f3e-4cfe-9913-36ab968bc741": {
    "id": "790e8b53-1f3e-4cfe-9913-36ab968bc741",
    "logo": "",
    "name": "Example Tournament",
    "fixture": {
      "type":"single-elimination",
      "matches": [
        ["a231b8b4-dbf3-46b1-8f61-1a731fc6f113","","","","","","",""],
        ["","","",""],
        ["",""],
        [""]
      ]
    }
  }
}
```

## currentTournament

ID of current tournament. Used as a key for the [tournaments](#tournaments) replicant

### Data

- `string` UUID of current tournament

### Example data

```JSON
"790e8b53-1f3e-4cfe-9913-36ab968bc741"
```

## Bundle Data/Settings

## serverRate

How often the server is receiving data from CSGO.

### Data

- `number` Messages per second

### Example data

```JSON
20
```

## bundleStatus

Data based on bundle settings. Not used much right now.

_Types available in [./src/types/bundle-status.d.ts](../src/types/bundle-status.d.ts)_

### Data

- `object`
  - `isServerOn` [boolean] Indicates if the manager is listening for CSGO

### Example data

```JSON
{
  "isServerOn": true
}
```

## gameSettings

Some touraments use different timings that graphics may rely on. This can be referenced here

_Types available in [./src/types/game-settings.d.ts](../src/types/game-settings.d.ts)_

### Data

- `object`
  - `bombTime` [number] How long it takes the bomb to explode in seconds
  - `bombPlantTime`  [number] How long it takes to plant the bomb in seconds
  - `noKitDefuseTime`  [number] How long it takes to defuse with no kit in seconds
  - `kitDefuseTime`  [number] How long it takes to defuse with a kit in seconds

### Example data

```JSON
{
  "bombTime": 40,
  "bombPlantTime": 3,
  "noKitDefuseTime": 10,
  "kitDefusedTime": 5,
}
```
