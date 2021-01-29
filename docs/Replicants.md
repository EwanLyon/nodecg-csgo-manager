# API Documentation: Replicants

_[Link to NodeCG documentation for reference.](https://www.nodecg.dev/docs/classes/replicant)_

CSGO Data

- [game](#game)
- [matchStats](#matchStats)
- [allPlayers](#allPlayers)
- [observingPlayer](#observingPlayer)
- [bomb](#bomb)
- [phase](#phase)
- [mapGrenades](#mapGrenades)
- [mapPlayers](#mapPlayers)
- [teamOne](#teamOne)
- [teamTwo](#teamTwo)
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

- `object`: CSGO

### Example data

Go to [csgo-example.json](./csgo-example.json)

This the raw untouched value that is obtained from the CSGO Game State Integration.

## matchStats

_Types available in [./src/types/csgo-gsi.d.ts](../src/types/csgo-gsi.d.ts)_

### Data

- `object`: Map

### Example data

```JSON
{
  "mode": "competitive",
  "name": "de_dust2",
  "phase": "live",
  "round": 4,
  "team_ct": { "score": 0, "consecutive_round_losses": 5, "timeouts_remaining": 1, "matches_won_this_series": 0 },
  "team_t": { "score": 4, "consecutive_round_losses": 0, "timeouts_remaining": 1, "matches_won_this_series": 0 },
  "num_matches_to_win_series": 0,
  "current_spectators": 0,
  "souvenirs_total": 0,
  "round_wins": { "1": "t_win_bomb", "2": "t_win_bomb", "3": "t_win_elimination", "4": "t_win_elimination" }
}
```

The map property of the raw CSGO Game State Integration.

## allPlayers

_Types available in [./src/types/csgo-gsi.d.ts](../src/types/csgo-gsi.d.ts)_

### Data

- `[object]`: CSGOAllplayer[]

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
    "match_stats": { "kills": 1, "assists": 1, "deaths": 4, "mvps": 0, "score": 3 },
    "weapons": {
      "weapon_0": { "name": "weapon_knife", "paintkit": "default", "type": "Knife", "state": "holstered" },
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

Array of all players from the `allplayers` property. Made into an array with a new steamId property and if observer slot is 0 it is changed to 10.

## observingPlayer

_Types available in [./src/types/csgo-gsi.d.ts](../src/types/csgo-gsi.d.ts)_

### Data

- `object | undefined`: CSGOPlayer | undefined

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

Data of the abserved player

## bomb

_Types available in [./src/types/csgo-gsi.d.ts](../src/types/csgo-gsi.d.ts)_

### Data

- `object`: CSGOBomb

### Example data

```JSON
{
  "state": "carried",
  "position": "-403.47, 473.20, -4.72",
  "player": "76561197960265732"
}
```

Status of the bomb, whether it is dropped, being carried or planted.

## phase

_Types available in [./src/types/csgo-gsi.d.ts](../src/types/csgo-gsi.d.ts)_

### Data

- `object`: CSGOPhaseCountdowns

### Example data

```JSON
{
  "phase": "live",
  "phase_ends_in": "105.8"
}
```

What state the game is currently in.

## mapGrenades

_Types available in [./src/types/csgo-gsi.d.ts](../src/types/csgo-gsi.d.ts)_

### Data

- `object`: CSGOGrenadesAll

### Example data

```JSON
{
  "765": {
    "owner": 76561197960265732,
    "position": "-220.44, 245.03, -2.44",
    "velocity": "-583.21, 491.35, -120.78",
    "lifetime": "1.4",
    "type": "smoke"
  }
}
```

List of all grenades that are active. Incendiary and Molotovs are called `firebomb` and each flame is sent as a grenade.

## mapPlayers

_Types available in [./src/types/csgo-gsi.d.ts](../src/types/csgo-gsi.d.ts)_

### Data

- `[object]`: MapPlayerData[]

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

A cleaned object showing only the necessary information needed to place a player on a mini map. NOT INTERPRETED.

## teamOne

_Types available in [./src/types/extra-data.d.ts](../src/types/extra-data.d.ts)_

### Data

- `object`: TeamData

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

## teamTwo

_Types available in [./src/types/extra-data.d.ts](../src/types/extra-data.d.ts)_

### Data

- `object`: TeamData

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

teamTwo is the team who is the counter-terrorists in the first half.

## playerData

_Types available in [./src/types/extra-data.d.ts](../src/types/extra-data.d.ts)_

### Data

- `object`: PlayerDataAll

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

Extra player data including game data and steam profile data information not given by CSGO.

## round30Winner

### Data

- `string`

### Example data

```JSON
"CT"
```

Due to a bug round wins after round 29 are not logged. This causes an off by one error in the overtime rounds calculator because of round 30. This will record who won round 30 for the internal calulation. It does not log how the round was won only who won it.

## HLAE

## hlaeActive

### Data

- `boolean`

### Example data

```JSON
false
```

If HLAE is active/connected or not.

## matchKills

_Types available in [./src/types/hlae.d.ts](../src/types/hlae.d.ts)_

### Data

- `[object]`: PlayerDeath[]

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

Array of all deaths made in match.

## Map Data

## interpMapPlayers

_Types available in [./src/types/map-player.d.ts](../src/types/map-player.d.ts)_

### Data

- `object`: Record<string, MapPlayerData>

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

Similar to mapPlayers but the position and rotation are smoothed as the raw values are choppy.

## matches

_Types available in [./src/types/matches.d.ts](../src/types/matches.d.ts)_

### Data

- `[object]`: Matches

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

All matches scheduled, the vetos and final score.

## currentMatch

_Types available in [./src/types/matches.d.ts](../src/types/matches.d.ts)_

### Data

- `object | undefined`: Match | undefined

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

The current match being played. Undefined if no match.

## Team/Player assets

## teamPlayerPreset

_Types available in [./src/types/team-preset.d.ts](../src/types/team-preset.d.ts)_

### Data

- `object`: TeamPreset

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

Data on all imported team and player information.

## Tournaments

## tournaments

_Types available in [./src/types/tournament.d.ts](../src/types/tournament.d.ts)_

### Data

- `object`: TeamPreset

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

Dictionary of all tournaments.

## currentTournament

### Data

- `string`

### Example data

```JSON
"790e8b53-1f3e-4cfe-9913-36ab968bc741"
```

ID of current tournament.

## Bundle Data/Settings

## serverRate

### Data

- `number`

### Example data

```JSON
20
```

How often the server is receiving data from CSGO.

## bundleStatus

_Types available in [./src/types/bundle-status.d.ts](../src/types/bundle-status.d.ts)_

### Data

- `object`: BundleStatus

### Example data

```JSON
{
  "isServerOn": true
}
```

Data based on bundle settings. Not used much right now.

## gameSettings

_Types available in [./src/types/game-settings.d.ts](../src/types/game-settings.d.ts)_

### Data

- `object`: BundleStatus

### Example data

```JSON
{
  "bombTime": 40,
  "bombPlantTime": 3,
  "noKitDefuseTime": 10,
  "kitDefusedTime": 5,
}
```

Some touraments use different timings that graphics may rely on. This can be referenced here
