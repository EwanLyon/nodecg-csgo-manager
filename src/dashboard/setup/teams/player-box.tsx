import React, { useState } from 'react';
import styled from 'styled-components';
//@ts-ignore
import Twemoji from 'react-twemoji';
import { Grid, Button, MenuItem, FormControl, InputLabel, Select, TextField, IconButton } from '@material-ui/core';
import Edit from '@material-ui/icons/Edit';

// Dialog
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import { CSGOAllplayer } from '../../../types/csgo-gsi';
import { PlayerData } from '../../../types/extra-data';
import { Asset } from '../../../types/nodecg';
import { useReplicant } from 'use-nodecg';
import { flagList } from '../../atoms/flag-list';

const boxHeight = 90;

const Container = styled(Grid)`
	width: 100%;
	margin: 5px 0;
	box-shadow: rgba(0, 0, 0, 0.2) 0px 3px 3px -2px, rgba(0, 0, 0, 0.14) 0px 3px 4px 0px,
		rgba(0, 0, 0, 0.12) 0px 1px 8px 0px;
	border-radius: 4px;
	overflow: hidden;
`;

const DataBox = styled(Grid)`
	background: #435370;
	padding: 5px;
	height: ${boxHeight}px;
	position: relative;
`;

const ObservationSlot = styled.span`
	font-weight: light;
	font-style: italic;
	color: #979da8;
	margin-right: 5px;
`;

const SteamID = styled.span`
	font-size: 7px;
	color: #979da8;
`;

const PlayerImage = styled.img`
	height: ${boxHeight}px;
	width: 64px;
	object-fit: contain;
	background: #525f78;
`;

const TwemojiBox = styled(Twemoji)`
	& > .emoji {
		height: 30px;
		margin-bottom: -6px;
	}
	margin-right: 7px;
`;

const TwemojiMenuItem = styled(Twemoji)`
	& > .emoji {
		height: 50px;
	}
	margin-right: 7px;
`;

const EditButton = styled(IconButton)`
	position: absolute;
	top: 0;
	right: 0;
`;

const SpacedDialogContent = styled(DialogContent)`
	& > * {
		margin: 4px 0;
	}
`;

interface Props {
	player: CSGOAllplayer;
	extraPlayer: PlayerData;
}

export const PlayerBox: React.FC<Props> = (props: Props) => {
	const [profilePicturesRep] = useReplicant<Asset[]>('assets:playerIcons', []);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [localPfp, setLocalPfp] = useState('');
	const [localCountry, setLocalCountry] = useState('');
	const [localName, setLocalName] = useState('');

	const profilePicsMap = profilePicturesRep.map((pfp) => {
		return (
			<MenuItem key={pfp.base} value={pfp.url}>
				<img style={{ height: 50, width: 'auto', objectFit: 'scale-down', marginRight: 10 }} src={pfp.url} />
				{pfp.name}
			</MenuItem>
		);
	});

	const urlsOfPfps = profilePicturesRep.map((pfp) => pfp.url);
	if (props.extraPlayer?.image && !urlsOfPfps.includes(props.extraPlayer.image)) {
		profilePicsMap.push(
			<MenuItem key={props.extraPlayer.image} value={props.extraPlayer.image}>
				<img
					style={{ height: 50, width: 'auto', objectFit: 'scale-down', marginRight: 10 }}
					src={props.extraPlayer.image}
				/>
				<em>External Image</em>
			</MenuItem>,
		);
	}

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

	const handlePlayerUpdate = (): void => {
		setDialogOpen(false);
		const playerId = props.player.steamId;

		if (localName !== props.extraPlayer?.name) {
			nodecg.sendMessage('updatePlayerName', { id: playerId, name: localName });
		}

		if (localPfp !== props.extraPlayer?.image) {
			nodecg.sendMessage('updatePlayerProfilePicture', { id: playerId, url: localPfp });
		}

		if (localCountry !== props.extraPlayer?.country) {
			nodecg.sendMessage('updatePlayerCountry', { id: playerId, country: localCountry });
		}
	};

	function openDialog() {
		setLocalName(props.extraPlayer?.name || '');
		setLocalCountry(props.extraPlayer?.country || '');
		setLocalPfp(props.extraPlayer?.image || '');
		setDialogOpen(true);
	}

	return (
		<Container container alignItems="center">
			<PlayerImage src={props.extraPlayer?.image || '../shared/media/MissingProfileImage.png'} />
			<DataBox container direction="column" justify="space-around" item xs>
				<Grid item>
					<ObservationSlot>{props.player.observer_slot}</ObservationSlot>
					<span>{props.player.name}</span>
				</Grid>
				<Grid item container alignItems="center">
					<TwemojiBox>{props.extraPlayer?.country || 'N/A'}</TwemojiBox>
					<span>{props.extraPlayer?.name || <em>No Name</em>}</span>
				</Grid>
				<Grid item>
					<SteamID>{props.player.steamId}</SteamID>
				</Grid>

				<EditButton size="small" onClick={openDialog}>
					<Edit />
				</EditButton>
			</DataBox>

			{/* Profile Settings Dialog */}
			<Dialog open={dialogOpen} onClose={(): void => setDialogOpen(false)} fullWidth>
				<DialogTitle>Editing {props.player.name}</DialogTitle>
				<SpacedDialogContent>
					<FormControl variant="filled" fullWidth>
						<InputLabel id="pfpLabel">Profile Picture</InputLabel>
						<Select
							labelId="pfpLabel"
							value={localPfp || props.extraPlayer?.image}
							onChange={(e): void => setLocalPfp(e.target.value as string)}>
							{profilePicsMap}
						</Select>
					</FormControl>
					<br />
					<FormControl variant="filled" fullWidth>
						<InputLabel id="countryLabel">Country</InputLabel>
						<Select
							labelId="countryLabel"
							value={localCountry}
							onChange={(e): void => setLocalCountry(e.target.value as string)}>
							{flagListMap}
						</Select>
					</FormControl>
					<br />
					<TextField
						label="Name"
						value={localName}
						onChange={(e): void => setLocalName(e.target.value as string)}
					/>
				</SpacedDialogContent>
				<DialogActions>
					<Button onClick={() => setDialogOpen(false)}>Cancel</Button>
					<Button onClick={handlePlayerUpdate}>Update</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
};
