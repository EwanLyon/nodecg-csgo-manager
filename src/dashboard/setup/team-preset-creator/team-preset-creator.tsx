/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
// @ts-ignore
import Twemoji from 'react-twemoji';
import { render } from 'react-dom';
import { useListenFor, useReplicant } from 'use-nodecg';

import {
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Button,
	Grid,
	Snackbar,
	CircularProgress,
} from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';

import { flagList } from '../../atoms/flag-list';
import { theme } from '../../theme';
import { TeamsPreset } from '../../../types/team-preset';
import { DummyTeamsPreset } from '../../../extension/dummyData';
import { FullTeam } from 'hltv/lib/models/FullTeam';

const ControlsContainer = styled.div`
	& > * {
		margin-top: 5px !important;
	}
`;

const SectionTitle = styled.span`
	font-size: 20px;
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
	url: '',
};

const TwemojiMenuItem = styled(Twemoji)`
	& > .emoji {
		height: 50px;
	}
	margin-right: 7px;
`;

export const TeamPresetCreator: React.FC = () => {
	const [profilePicturesRep] = useReplicant<Asset[]>('assets:playerIcons', [DummyAsset]);
	const [teamImagesRep] = useReplicant<Asset[]>('assets:teamimages', [DummyAsset]);
	const [teamPresetsRep] = useReplicant<TeamsPreset>('teamPreset', DummyTeamsPreset);
	const [steamId, setSteamId] = useState('');
	const [localName, setLocalName] = useState('');
	const [localPfp, setLocalPfp] = useState('');
	const [localCountry, setLocalCountry] = useState('');
	const [localLogo, setLocalLogo] = useState('');
	const [localTeamName, setLocalTeamName] = useState('');
	const [localTeamAlias, setLocalTeamAlias] = useState('');
	const [localTeamPresetAlias, setLocalTeamPresetAlias] = useState('');
	const [localHLTV, setLocalHLTV] = useState('');
	const [hltvLogo, setHLTVLogo] = useState('');
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMsg, setSnackbarMsg] = useState('Error: Snackbar message not set');
	const [teamLoading, setTeamLoading] = useState(false);

	// Already done teams
	const teamPresetList = Object.entries(teamPresetsRep.teams).map(([key, team]) => {
		return (
			<MenuItem key={key} value={team.alias}>
				<img
					style={{
						height: 50,
						width: 50,
						objectFit: 'scale-down',
						marginRight: 10,
					}}
					src={team.logo}
				/>
				{team.name}
			</MenuItem>
		);
	});

	// Already done players
	const playerPresetList = Object.entries(teamPresetsRep.players).map(([key, player]) => {
		return (
			<MenuItem key={key} value={player.steamId}>
				<img
					style={{
						height: 50,
						width: 50,
						objectFit: 'scale-down',
						marginRight: 10,
					}}
					src={player.profilePicture}
				/>
				<Grid container>
					<span style={{ fontSize: 10, color: '#777' }}>{player.steamId}</span>
					{player.realName}
				</Grid>
			</MenuItem>
		);
	});

	// Team logos
	const teamLogoList = teamImagesRep.map((img) => {
		return (
			<MenuItem key={img.base} value={img.url}>
				<img
					style={{
						height: 50,
						width: 50,
						objectFit: 'scale-down',
						marginRight: 10,
					}}
					src={img.url}
				/>
				{img.name}
			</MenuItem>
		);
	});

	if (hltvLogo) {
		teamLogoList.push(
			<MenuItem key={hltvLogo} value={hltvLogo}>
				<img
					style={{
						height: 50,
						width: 50,
						objectFit: 'scale-down',
						marginRight: 10,
					}}
					src={hltvLogo}
				/>
				<i>HLTV {localTeamName}</i>
			</MenuItem>,
		);
	}

	// Profile Pics
	const profilePicsMap = profilePicturesRep.map((pfp) => {
		return (
			<MenuItem key={pfp.base} value={pfp.url}>
				<img style={{ height: 50, width: 'auto', objectFit: 'scale-down', marginRight: 10 }} src={pfp.url} />
				{pfp.name}
			</MenuItem>
		);
	});

	// Flags
	const flagListMap = flagList.map((flag, index) => {
		return (
			<MenuItem key={index} value={flag.code} style={{ display: 'flex', alignItems: 'center' }}>
				<TwemojiMenuItem>{flag.code}</TwemojiMenuItem> {flag.name}
			</MenuItem>
		);
	});

	flagListMap.push(
		<MenuItem key={-1} value={''}>
			<em>No Flag</em>
		</MenuItem>,
	);

	// Fill in team blanks
	useEffect(() => {
		if (localTeamPresetAlias) {
			const foundTeamPreset = teamPresetsRep.teams[localTeamName];
			if (foundTeamPreset) {
				setLocalTeamAlias(foundTeamPreset.alias);
				setLocalTeamName(foundTeamPreset.name);
				setLocalLogo(foundTeamPreset.logo || '');
			}
		} else {
			setLocalTeamAlias('');
			setLocalTeamName('');
			setLocalLogo('');
		}
	}, [localTeamPresetAlias, teamPresetsRep.teams]);

	// Fill in player blanks
	useEffect(() => {
		if (steamId) {
			const foundPlayerPreset = teamPresetsRep.players[steamId];
			if (foundPlayerPreset) {
				setLocalName(foundPlayerPreset.realName || '');
				setLocalPfp(foundPlayerPreset.profilePicture || '');
				setLocalCountry(foundPlayerPreset.country || '');
			}
		} else {
			setLocalName('');
			setLocalPfp('');
			setLocalCountry('');
		}
	}, [steamId, teamPresetsRep.players]);

	// Updater functions
	function AddTeam(): void {
		console.log('Adding team: ' + localTeamName);
		nodecg.sendMessage('newTeam', { name: localTeamName, alias: localTeamAlias, logo: localLogo });

		setSnackbarMsg(`Added ${localName}`);
		setLocalTeamAlias('');
		setLocalTeamPresetAlias('');
		setLocalTeamName('');
		setLocalLogo('');
	}

	function AddPlayer(): void {
		console.log('Adding player: ' + localName);
		nodecg.sendMessage('newPlayer', {
			name: localName,
			steamId,
			pfp: localPfp,
			country: localCountry,
		});

		setSnackbarMsg(`Added ${localName}`);
		setLocalName('');
		setSteamId('');
		setLocalPfp('');
		setLocalCountry('');
	}

	function Save(): void {
		console.log('Saving');
		nodecg.sendMessage('exportTeams');
	}

	function GetHLTVTeam() {
		nodecg.sendMessage('getHLTVTeam', parseInt(localHLTV));
		setTeamLoading(true);
	}

	useListenFor('hltvTeamReturn', (data: FullTeam) => {
		setLocalTeamName(data.name);
		setLocalLogo(data.logo);
		setLocalTeamAlias(data.name);
		setHLTVLogo(data.logo);
		setTeamLoading(false);
	});

	useListenFor('newTeamPlayerResponse', (err?: string) => {
		if (err) setSnackbarMsg(`Error: ${err}`);
		setSnackbarOpen(true);
	});

	function closeSnackbar() {
		setSnackbarOpen(false);
	}

	return (
		<ThemeProvider theme={theme}>
			<ControlsContainer>
				<SectionTitle>Team</SectionTitle>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<TextField
						required
						label="HLTV ID"
						value={localHLTV}
						onChange={(e): void => setLocalHLTV(e.target.value as string)}
					/>
					<div style={{ position: 'relative', height: '100%' }}>
						<Button variant="contained" disabled={isNaN(parseInt(localHLTV)) || teamLoading} onClick={GetHLTVTeam}>
							Load
						</Button>
						{teamLoading && (
							<div
								style={{
									position: 'absolute',
									top: 0,
									width: '100%',
									height: '100%',
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
								}}>
								<CircularProgress size={24} />
							</div>
						)}
					</div>
				</div>
				<FormControl variant="filled" fullWidth>
					<InputLabel id="teamPresetsLabel">Team</InputLabel>
					<Select
						labelId="teamPresetsLabel"
						value={localTeamPresetAlias}
						onChange={(e): void => setLocalTeamPresetAlias(e.target.value as string)}>
						<MenuItem key={-1} value={''}>
							<em>Create new team</em>
						</MenuItem>
						{teamPresetList}
					</Select>
				</FormControl>
				<TextField
					required
					label="Name"
					value={localTeamName}
					onChange={(e): void => setLocalTeamName(e.target.value as string)}
					fullWidth
				/>
				<FormControl variant="filled" fullWidth>
					<InputLabel id="teamLabel">Logo</InputLabel>
					<Select
						labelId="teamLabel"
						value={localLogo}
						onChange={(e): void => setLocalLogo(e.target.value as string)}>
						<MenuItem key={-1} value={''}>
							<em>No Team Logo</em>
						</MenuItem>
						{teamLogoList}
					</Select>
				</FormControl>
				<TextField
					required
					label="Alias"
					value={localTeamAlias}
					onChange={(e): void => setLocalTeamAlias(e.target.value as string)}
					fullWidth
				/>
				<Button fullWidth onClick={AddTeam} variant="contained" disabled={!localTeamName || !localTeamAlias}>
					Add Team
				</Button>
			</ControlsContainer>
			<hr />
			<ControlsContainer>
				<SectionTitle>Player</SectionTitle>
				<FormControl variant="filled" fullWidth>
					<InputLabel id="playerPresetsLabel">Player</InputLabel>
					<Select
						labelId="playerPresetsLabel"
						value={steamId}
						onChange={(e): void => setSteamId(e.target.value as string)}>
						<MenuItem key={-1} value={''}>
							<em>Create new player</em>
						</MenuItem>
						{playerPresetList}
					</Select>
				</FormControl>
				<TextField
					required
					label="SteamID"
					value={steamId}
					onChange={(e): void => setSteamId(e.target.value as string)}
					fullWidth
				/>
				<TextField
					label="Name"
					value={localName}
					onChange={(e): void => setLocalName(e.target.value as string)}
					fullWidth
				/>
				<FormControl variant="filled" fullWidth>
					<InputLabel id="pfpLabel">Profile Picture</InputLabel>
					<Select
						labelId="pfpLabel"
						value={localPfp}
						onChange={(e): void => setLocalPfp(e.target.value as string)}>
						<MenuItem key={-1} value={''}>
							<em>No Profile Picture</em>
						</MenuItem>
						{profilePicsMap}
					</Select>
				</FormControl>
				<FormControl variant="filled" fullWidth>
					<InputLabel id="countryLabel">Country</InputLabel>
					<Select
						labelId="countryLabel"
						value={localCountry}
						onChange={(e): void => setLocalCountry(e.target.value as string)}>
						{flagListMap}
					</Select>
				</FormControl>
				<Button fullWidth onClick={AddPlayer} variant="contained" disabled={!steamId}>
					Add Player
				</Button>
			</ControlsContainer>
			<hr />
			<Button fullWidth onClick={Save} variant="contained">
				Save Players and Teams
			</Button>
			<Snackbar
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				open={snackbarOpen}
				onClose={closeSnackbar}
				autoHideDuration={1000}
				message={snackbarMsg}
			/>
		</ThemeProvider>
	);
};

render(<TeamPresetCreator />, document.getElementById('teampresetcreator'));
