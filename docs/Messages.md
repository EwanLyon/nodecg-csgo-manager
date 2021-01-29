# API Documentation: Messages

_[Link to NodeCG documentation for reference.](https://www.nodecg.dev/docs/classes/listenFor)_

There are many messages used for interal communication between dashboard and extensions. These are not meant to be used in external uses and will remain undocumented.

Game

- [newPhase:...](#newPhase)
- [newBomb:...](#newBomb)
- [gameOver](#gameOver)

HLAE

- [hlae:playerDeath](#hlae:playerDeath)
- [hlae:weaponFire](#hlae:weaponFire)

## Usage

Example code

```javascript
nodecg.listenFor('message-name', 'nodecg-csgo-manager', (data) => {
  ...
});
```

## Game

## newPhase

When the round is in a new phase this will transmit the output as `newPhase:` + the phase name.
_No data is sent with this message_

### Possible messages

- 'newPhase:live'
- 'newPhase:bomb'
- 'newPhase:over'
- 'newPhase:freezetime'
- 'newPhase:paused'
- 'newPhase:defuse'
- 'newPhase:timeout_t'
- 'newPhase:timeout_ct'
- 'newPhase:warmup'

## newBomb

When the bomb is in a new state this will transmit the output as `newBomb:` + the state name.
_No data is sent with this message_

### Possible messages

- 'newBomb:planted'
- 'newBomb:exploded'
- 'newBomb:carried'
- 'newBomb:planting'
- 'newBomb:dropped'
- 'newBomb:defusing'
- 'newBomb:defused'

## gameOver

When the game is over send this message.

### Data

The final CSGO output data when the message gets sent.

See [csgo-example.json](./csgo-example.json) for example data.

_Types available in [./src/types/csgo-gsi.d.ts](../src/types/csgo-gsi.d.ts)_

## HLAE

_Types available in [./src/types/hlae.d.ts](../src/types/hlae.d.ts)_

## hlae:playerDeath

Message sent everytime a player is killed. Used for killfeeds.

### Data

```JSON
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
```

## hlae:weaponFire

Used to show weapon fire on the mini map. Remember to not show if the weapon is a knife.

```JSON
{
  "name": "weapon_fire",
  "clientTime": 214.359375,
  "keys": {
    "userid": {
      "value": 5,
      "xuid": "0",
      "eyeOrigin": [-413.68939208984375, 203.57778930664062, 64.22528839111328],
      "eyeAngles": [4.4766716957092285, 90.26315307617188, 4.2819314671760367e-7]
    },
    "weapon": "weapon_ak47",
    "silenced": false
  },
  "round": 2
}
```
