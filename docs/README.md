# NodeCG CSGO Manager Documentation

Currenlty have not written the documentation. However these are the replicants currently in use:

Data from CSGO GSI

* `game` Holds all game information
* `matchStats` Information about the current map/match, e.g. Round, map name
* `allPlayers` Array of players in match, e.g. Name, health, weapons
* `observingPlayer` Information on the player being observed. NOTE: Though the data is similar to allPlayers it does not contain weapon information.
* `bomb` Current state of the bomb, e.g. Planted or dropped, player carrying
* `phase` What phase the game is in and for how long, e.g. Live, Timeout, Warmup
* `mapGrenades` The position of grenades in the game

Data made from CSGO Manager

* `teamOne`/`teamTwo` Information from processed to fill in custom team names, logos, team grenades, etc. (TeamOne is whoever is terrorist during the first half. This may/should be changed to be clearer.)
* `playerData` Calculated information on specific player statistics, e.g. ADR, Name, Country
* `mapInfo` Calculated information on the map. Currently containing map pick/veto information.
* `swapTeams` Determines if the sides should be mirrored.
* `interpMapPlayers` A smooth and slightly delayed version of player positions. Useful for the minimap
* `teamPreset` List of preset team information
* `assets:teamPreset` Asset location of team preset files loaded from the assets tab
* `serverRate` How many times the manager is recieving GSI information from CSGO. (Done over a small rolling average)

Types can be found in `src/types`.
