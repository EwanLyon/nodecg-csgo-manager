/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import { useReplicant } from 'use-nodecg';
import styled from 'styled-components';

// React imports
import { shadow3 } from '../../atoms/shadows';
import { theme } from '../../theme';
import {
	InputBase,
	Grid,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Button,
	FormControlLabel,
	Checkbox,
	CheckboxProps
} from '@material-ui/core';
import { ThemeProvider, makeStyles, withStyles } from '@material-ui/styles';

// Interfaces
import { Map, CSGOOutputAllplayer } from '../../../types/csgo-gsi';
import { TeamData, PlayerDataAll } from '../../../types/extra-data';
import { TeamsPreset } from '../../../types/team-preset';
import * as DummyData from '../../../extension/dummyData';
import { PlayerBox } from './player-box';

// Centered input
const useStyles = makeStyles({
	input: {
		textAlign: 'center',
		fontSize: 23,
		width: 324
	}
});

const CheckBoxStyled = withStyles({
	root: {
		color: '#00BEBE',
		'&$checked': {
			color: '#00BEBE'
		}
	},
	checked: {}
})((props: CheckboxProps) => <Checkbox color="default" {...props} />);

const Divider = styled.div`
	width: 3px;
	background: #828995;
	margin: 0 11px;
`;

const TeamImage = styled.img`
	height: 68px;
	width: auto;
	margin-right: 15px;
	background: #525f78;
	border-radius: 10%;
	box-shadow: ${shadow3};
`;

interface Asset {
	base: string;
	bundleName: string;
	category: string;
	ext: string;
	name: string;
	sum: string;
	url: string;
}

const DummyAsset: Asset = {
	base: '',
	bundleName: 'csgo-layouts',
	category: '',
	ext: '',
	name: '',
	sum: '',
	url: ''
};

// eslint-disable-next-line complexity
export const Teams: React.FunctionComponent = () => {
	const classes = useStyles();
	const [teamImagesRep] = useReplicant<Asset[]>('assets:teamimages', [DummyAsset]);
	// const [gameRep] = useReplicant<CSGOOutput>('game', DummyData.game);
	const [matchRep] = useReplicant<Map>('matchStats', DummyData.match);
	const [teamOneRep] = useReplicant<TeamData>('teamOne', DummyData.TeamData);
	const [teamTwoRep] = useReplicant<TeamData>('teamTwo', DummyData.TeamData);
	const [allPlayersRep] = useReplicant<CSGOOutputAllplayer[]>('allPlayers', DummyData.player);
	const [playerDataRep] = useReplicant<PlayerDataAll>('playerData', DummyData.ExtraData);
	const [teamPresetsRep] = useReplicant<TeamsPreset>('teamPreset', DummyData.DummyTeamsPreset);

	const [teamOneName, setTeamOneName] = useState('');
	const [teamTwoName, setTeamTwoName] = useState('');
	const [teamOneURL, setTeamOneURL] = useState('');
	const [teamTwoURL, setTeamTwoURL] = useState('');
	const [teamOneDefault, setTeamOneDefault] = useState({ name: true, logo: true });
	const [teamTwoDefault, setTeamTwoDefault] = useState({ name: true, logo: true });
	const [swapTeamsRep, setSwapTeamsRep] = useReplicant('swapTeams', false);

	useEffect(() => {
		setTeamOneURL(teamOneRep.teamURL);
		setTeamOneName(teamOneRep.name);
	}, [teamOneRep.name, teamOneRep.teamURL]);

	useEffect(() => {
		setTeamTwoURL(teamTwoRep.teamURL);
		setTeamTwoName(teamTwoRep.name);
	}, [teamTwoRep.name, teamTwoRep.teamURL]);

	const teamPresetList = teamPresetsRep.teams.map(team => {
		return (
			<MenuItem key={team.name} value={team.name}>
				<img
					style={{
						height: 'auto',
						width: 50,
						objectFit: 'scale-down',
						marginRight: 10,
						maxHeight: 24
					}}
					src={team.logo}
				/>
				{team.name}
			</MenuItem>
		);
	});

	const teamLogoList = teamImagesRep.map(img => {
		return (
			<MenuItem key={img.base} value={img.url}>
				<img
					style={{
						height: 50,
						width: 50,
						objectFit: 'scale-down',
						marginRight: 10
					}}
					src={img.url}
				/>
				{img.name}
			</MenuItem>
		);
	});

	const teamOnePlayers = allPlayersRep.filter(player => {
		return teamOneRep.players.includes(player.steamId);
	});

	const teamTwoPlayers = allPlayersRep.filter(player => {
		return teamTwoRep.players.includes(player.steamId);
	});

	useEffect(() => {
		teamOnePlayers.forEach(player => {
			if (
				teamPresetsRep.players.find(playerPreset => playerPreset.steamId === player.steamId) &&
				!playerDataRep[player.steamId]
			) {
				nodecg.sendMessage(
					'pushNewPlayerData',
					teamPresetsRep.players.find(playerPreset => playerPreset.steamId === player.steamId)
				);
			}
		});
		teamTwoPlayers.forEach(player => {
			if (
				teamPresetsRep.players.find(playerPreset => playerPreset.steamId === player.steamId) &&
				!playerDataRep[player.steamId]
			) {
				nodecg.sendMessage(
					'pushNewPlayerData',
					teamPresetsRep.players.find(playerPreset => playerPreset.steamId === player.steamId)
				);
			}
		});
	}, [playerDataRep, teamOnePlayers, teamPresetsRep, teamTwoPlayers]);

	const teamOnePlayersMap = teamOnePlayers.map(player => {
		return (
			<PlayerBox extraPlayer={playerDataRep[player.steamId]} player={player} key={player.steamId} />
		);
	});

	const teamTwoPlayersMap = teamTwoPlayers.map(player => {
		return (
			<PlayerBox extraPlayer={playerDataRep[player.steamId]} player={player} key={player.steamId} />
		);
	});

	function updateT1(): void {
		// Names
		if (teamOneRep.name !== teamOneName)
			nodecg.sendMessage('updateName', { name: teamOneName, teamTwo: false });

		// Logo
		if (teamOneRep.teamURL !== teamOneURL)
			nodecg.sendMessage('updateLogo', { url: teamOneURL, teamTwo: false });
	}

	function updateT2(): void {
		// Names
		if (teamTwoRep.name !== teamTwoName)
			nodecg.sendMessage('updateName', { name: teamTwoName, teamTwo: true });
		// Logo
		if (teamTwoRep.teamURL !== teamTwoURL)
			nodecg.sendMessage('updateLogo', { url: teamTwoURL, teamTwo: true });
	}

	return (
		<ThemeProvider theme={theme}>
			<Grid
				container
				direction="column"
				justify="center"
				alignItems="center"
				style={{ fontSize: 20 }}
			>
				<Grid item>
					<span style={{ fontWeight: 'lighter' }}>Round </span>
					<span>{matchRep.round}</span>
				</Grid>
				<Grid item container direction={swapTeamsRep ? 'row-reverse' : 'row'} justify="center">
					<span>{teamOneRep.score}</span>
					<span style={{ margin: '0 15px' }}>:</span>
					<span>{teamTwoRep.score}</span>
				</Grid>
				<Button
					variant="contained"
					style={{ marginTop: 10 }}
					onClick={() => setSwapTeamsRep(!swapTeamsRep)}
				>
					Swap Teams
				</Button>
				<Button
					variant="contained"
					style={{ marginTop: 10 }}
					onClick={() => nodecg.sendMessage('getAllProfileData')}
				>
					Download steam profiles
				</Button>
			</Grid>
			<Grid
				container
				spacing={0}
				direction={swapTeamsRep ? 'row-reverse' : 'row'}
				style={{ padding: '15px 0' }}
			>
				<Grid container item xs direction="column" justify="center" spacing={0}>
					<Grid item xs>
						<InputBase
							classes={{
								input: classes.input
							}}
							value={teamOneName}
							disabled={teamOneDefault.name}
							onChange={(e): void => setTeamOneName(e.target.value)}
						/>
					</Grid>
					<Grid item>
						<Grid item container direction="row" alignItems="center">
							<TeamImage src={teamOneURL} />
							<FormControl variant="filled" style={{ flexGrow: 1 }}>
								<InputLabel id="teamOneLogoLabel">Logo</InputLabel>
								<Select
									labelId="teamOneLogoLabel"
									value={teamOneURL}
									disabled={teamOneDefault.logo}
									onChange={(e): void => setTeamOneURL(e.target.value as string)}
								>
									{teamLogoList}
								</Select>
							</FormControl>
						</Grid>
						<FormControlLabel
							control={
								<CheckBoxStyled
									checked={teamOneDefault.name}
									onChange={(e): void =>
										setTeamOneDefault({ ...teamOneDefault, name: e.target.checked })
									}
								/>
							}
							label="Default Name"
						/>
						<FormControlLabel
							control={
								<CheckBoxStyled
									checked={teamOneDefault.logo}
									onChange={(e): void =>
										setTeamOneDefault({ ...teamOneDefault, logo: e.target.checked })
									}
								/>
							}
							label="Default Logo"
						/>
						<FormControl variant="filled" fullWidth>
							<InputLabel id="teamOnePreset">Preset</InputLabel>
							<Select
								labelId="teamOnePreset"
								value={teamOneName}
								onChange={(e): void => {
									setTeamOneName(
										teamPresetsRep.teams.find(team => team.name === e.target.value)?.name || ''
									);
									setTeamOneURL(
										teamPresetsRep.teams.find(team => team.name === e.target.value)?.logo || ''
									);
								}}
							>
								<MenuItem key={0} value={''}>
									<em>No Team</em>
								</MenuItem>
								{teamPresetList}
							</Select>
						</FormControl>
						<Button variant="contained" fullWidth onClick={updateT1}>
							Update
						</Button>
					</Grid>
					<br />
					<Grid>{teamOnePlayersMap}</Grid>
				</Grid>
				<Divider />
				<Grid item xs>
					<InputBase
						classes={{
							input: classes.input
						}}
						value={teamTwoName}
						disabled={teamTwoDefault.name}
						onChange={(e): void => setTeamTwoName(e.target.value)}
					/>
					<Grid item>
						<Grid item container direction="row" alignItems="center">
							<TeamImage src={teamTwoURL} />
							<FormControl variant="filled" style={{ flexGrow: 1 }}>
								<InputLabel id="teamTwoLogoLabel">Logo</InputLabel>
								<Select
									labelId="teamTwoLogoLabel"
									value={teamTwoURL}
									disabled={teamTwoDefault.logo}
									onChange={(e): void => setTeamTwoURL(e.target.value as string)}
								>
									{teamLogoList}
								</Select>
							</FormControl>
						</Grid>
						<FormControlLabel
							control={
								<CheckBoxStyled
									checked={teamTwoDefault.name}
									onChange={(e): void =>
										setTeamTwoDefault({ ...teamTwoDefault, name: e.target.checked })
									}
								/>
							}
							label="Default Name"
						/>
						<FormControlLabel
							control={
								<CheckBoxStyled
									checked={teamTwoDefault.logo}
									onChange={(e): void =>
										setTeamTwoDefault({ ...teamTwoDefault, logo: e.target.checked })
									}
								/>
							}
							label="Default Logo"
						/>
						<FormControl variant="filled" fullWidth>
							<InputLabel id="teamTwoPreset">Preset</InputLabel>
							<Select
								labelId="teamTwoPreset"
								value={teamTwoName}
								onChange={(e): void => {
									setTeamTwoName(
										teamPresetsRep.teams.find(team => team.name === e.target.value)?.name || ''
									);
									setTeamTwoURL(
										teamPresetsRep.teams.find(team => team.name === e.target.value)?.logo || ''
									);
								}}
							>
								<MenuItem key={0} value={''}>
									<em>No Team</em>
								</MenuItem>
								{teamPresetList}
							</Select>
						</FormControl>
						<Button variant="contained" fullWidth onClick={updateT2}>
							Update
						</Button>
					</Grid>
					<br />
					<Grid>{teamTwoPlayersMap}</Grid>
				</Grid>
			</Grid>
		</ThemeProvider>
	);
};

render(<Teams />, document.getElementById('teams'));
