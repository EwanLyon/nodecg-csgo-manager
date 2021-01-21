/* eslint-disable no-undef */
import React, { useEffect } from 'react';
import { render } from 'react-dom';
import { useReplicant } from 'use-nodecg';
import styled from 'styled-components';

// React imports
import { theme } from '../../theme';
import { Grid, Button } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { Team } from './team';

// Interfaces
import { Map, CSGOOutputAllplayer } from '../../../types/csgo-gsi';
import { TeamData, PlayerDataAll } from '../../../types/extra-data';
import { TeamsPreset } from '../../../types/team-preset';
import * as DummyData from '../../../extension/dummyData';
import { Match } from '../../../types/matches';

const Divider = styled.div`
	width: 3px;
	background: #828995;
	margin: 0 10px;
`;

export const Teams: React.FunctionComponent = () => {
	const [matchRep] = useReplicant<Map>('matchStats', DummyData.match);
	const [teamOneRep] = useReplicant<TeamData>('teamOne', DummyData.TeamData);
	const [teamTwoRep] = useReplicant<TeamData>('teamTwo', DummyData.TeamData);
	const [allPlayersRep] = useReplicant<CSGOOutputAllplayer[]>('allPlayers', DummyData.player);
	const [playerDataRep] = useReplicant<PlayerDataAll>('playerData', DummyData.ExtraData);
	const [teamPresetsRep] = useReplicant<TeamsPreset>('teamPlayerPreset', DummyData.DummyTeamsPreset);
	const [currentMatchRep] = useReplicant<Match | undefined>('currentMatch', undefined);
	const [swapTeamsRep, setSwapTeamsRep] = useReplicant('swapTeams', false);

	const teamOnePlayers = allPlayersRep.filter((player) => {
		return teamOneRep.players.includes(player.steamId);
	});

	const teamTwoPlayers = allPlayersRep.filter((player) => {
		return teamTwoRep.players.includes(player.steamId);
	});

	useEffect(() => {
		teamOnePlayers.forEach((player) => {
			if (teamPresetsRep.players[player.steamId] && !playerDataRep[player.steamId]) {
				nodecg.sendMessage('pushNewPlayerData', teamPresetsRep.players[player.steamId]);
			}
		});

		teamTwoPlayers.forEach((player) => {
			if (teamPresetsRep.players[player.steamId] && !playerDataRep[player.steamId]) {
				nodecg.sendMessage('pushNewPlayerData', teamPresetsRep.players[player.steamId]);
			}
		});
	}, [playerDataRep, teamOnePlayers, teamPresetsRep, teamTwoPlayers]);

	return (
		<ThemeProvider theme={theme}>
			<Grid container direction="column" justify="center" alignItems="center" style={{ fontSize: 20 }}>
				<Grid item>
					<span style={{ fontWeight: 'lighter' }}>Round </span>
					<span>{matchRep.round}</span>
				</Grid>
				<Grid item container direction={swapTeamsRep ? 'row-reverse' : 'row'} justify="center">
					<span>{teamOneRep.score}</span>
					<span style={{ margin: '0 15px' }}>:</span>
					<span>{teamTwoRep.score}</span>
				</Grid>
				<Button variant="contained" style={{ marginTop: 10 }} onClick={() => setSwapTeamsRep(!swapTeamsRep)}>
					Swap visual sides
				</Button>
				<Button variant="contained" style={{ marginTop: 10 }} onClick={() => nodecg.sendMessage('switchTeamAandB')}>
					Swap Team Name
				</Button>
				<Button
					variant="contained"
					style={{ marginTop: 10 }}
					onClick={() => nodecg.sendMessage('getAllProfileData')}>
					Download steam profiles
				</Button>
			</Grid>
			<Grid container spacing={0} direction={swapTeamsRep ? 'row-reverse' : 'row'} justify="space-evenly" style={{ padding: '15px 0' }}>
				<Team team={currentMatchRep?.teamA} players={teamOnePlayers} />
				<Divider />
				<Team team={currentMatchRep?.teamB} players={teamTwoPlayers} />
			</Grid>
		</ThemeProvider>
	);
};

render(<Teams />, document.getElementById('teams'));
