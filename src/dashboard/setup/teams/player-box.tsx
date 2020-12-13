/* eslint-disable no-undef */
import React, { useState, ReactNode } from 'react';
import styled from 'styled-components';
//@ts-ignore
import Twemoji from 'react-twemoji';
import {
	Grid,
	Button,
	MenuItem,
	FormControl,
	InputLabel,
	Select,
	TextField,
	withStyles,
	Theme,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Edit from '@material-ui/icons/Edit';

// Dialog
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import { CSGOOutputAllplayer } from '../../../types/csgo-gsi';
import { PlayerData } from '../../../types/extra-data';
import { useReplicant } from 'use-nodecg';
import { flagList } from '../../atoms/flag-list';
import { lightBlue } from '@material-ui/core/colors';

const boxHeight = 90;

const Container = styled(Grid)`
	margin: 5px 0;
	box-shadow: rgba(0, 0, 0, 0.2) 0px 3px 3px -2px, rgba(0, 0, 0, 0.14) 0px 3px 4px 0px,
		rgba(0, 0, 0, 0.12) 0px 1px 8px 0px;
	border-radius: 4px 0 0 4px;
	overflow: hidden;
`;

const DataBox = styled(Grid)`
	background: #435370;
	padding: 5px;
	height: ${boxHeight}px;
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

const EditButton = withStyles((theme: Theme) => ({
	root: {
		minWidth: 10,
		minHeight: boxHeight,
		borderTopLeftRadius: 0,
		borderBottomLeftRadius: 0,
		color: theme.palette.getContrastText(lightBlue[600]),
		backgroundColor: lightBlue[600],
		'&:hover': {
			backgroundColor: lightBlue[400],
		},
	},
}))(Button);

interface Props {
	player: CSGOOutputAllplayer;
	extraPlayer: PlayerData;
}

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

export const PlayerBox: React.FC<Props> = (props: Props) => {
	const [profilePicturesRep] = useReplicant<Asset[]>('assets:playerIcons', [DummyAsset]);
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
			</DataBox>

			<EditButton size="small" onClick={(): void => setDialogOpen(true)}>
				<Edit />
			</EditButton>

			{/* Profile Settings Dialog */}
			<Dialog open={dialogOpen} onClose={(): void => setDialogOpen(false)} fullWidth>
				<DialogTitle>Editing {props.player.name}</DialogTitle>
				<DialogContent>
					<FormControl variant="filled" fullWidth>
						<InputLabel id="pfpLabel">Profile Picture</InputLabel>
						<Select
							labelId="pfpLabel"
							value={localPfp || props.extraPlayer?.image}
							onChange={(e): void => setLocalPfp(e.target.value as string)}>
							{profilePicsMap}
						</Select>
					</FormControl>
					<Autocomplete
						id="combo-box-demo"
						options={flagList}
						getOptionLabel={(option: typeof flagList[0]): string => option.code}
						renderOption={(option: typeof flagList[0]): ReactNode => (
							<React.Fragment>
								<TwemojiMenuItem>{option.code}</TwemojiMenuItem> {option.name}
							</React.Fragment>
						)}
						renderInput={(params: object): ReactNode => (
							<TextField {...params} label="Country" variant="filled" fullWidth />
						)}
						onInputChange={(_e, v): void => {
							setLocalCountry(v);
						}}
					/>
					<TextField
						label="Name"
						value={localName}
						onChange={(e): void => setLocalName(e.target.value as string)}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={(): void => setDialogOpen(false)}>Cancel</Button>
					<Button onClick={handlePlayerUpdate}>Update</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
};
