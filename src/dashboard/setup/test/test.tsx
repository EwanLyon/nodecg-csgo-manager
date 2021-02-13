import React from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';

import { PlayerDeath } from '../../../../types/hlae';

import { theme } from '../../theme';
import { Button } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';

import { RedButton } from '../../atoms/styled-ui';

const ExamplePlayerDeath: PlayerDeath = {
	name: 'player_death',
	clientTime: 168.671875,
	keys: {
		userid: {
			value: 4,
			xuid: '0',
			eyeOrigin: [-373.6505126953125, 1573.7967529296875, -62.60200500488281],
			eyeAngles: [355.6109619140625, 260.3814697265625, 0],
		},
		attacker: {
			value: 5,
			xuid: '0',
			eyeOrigin: [-407.38153076171875, 122.61137390136719, 65.26649475097656],
			eyeAngles: [6.102906227111816, 88.37369537353516, -2.1465999111569545e-7],
		},
		assister: {
			value: 0,
			xuid: '0',
			eyeOrigin: [0, 0, 0],
			eyeAngles: [0, 0, 0],
		},
		assistedflash: false,
		weapon: 'ak47',
		weaponItemid: '0',
		weaponFauxitemid: '17293822569102704647',
		weaponOriginalownerXuid: '0',
		headshot: false,
		dominated: 0,
		revenge: 0,
		wipe: 0,
		penetrated: 0,
		noreplay: true,
		noscope: false,
		thrusmoke: false,
		attackerblind: false,
		distance: 36.895103454589844,
	},
	round: 1,
};

const LargePlayerDeath: PlayerDeath = {
	...ExamplePlayerDeath,
	keys: {
		...ExamplePlayerDeath.keys,
		assister: {
			...ExamplePlayerDeath.keys.assister,
			value: 0,
		},
		weapon: 'awp',
		headshot: true,
		penetrated: 1,
		noscope: true,
		thrusmoke: true,
		attackerblind: true,
	},
};

const ButtonContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const Test: React.FC = () => {
	return (
		<ThemeProvider theme={theme}>
			<ButtonContainer>
				<RedButton
					variant="contained"
					fullWidth
					onClick={() => {
						nodecg.sendMessage('test:stop');
					}}>
					Stop
				</RedButton>
				<Button
					variant="contained"
					fullWidth
					onClick={() => {
						nodecg.sendMessage('test:standard');
					}}>
					Standard
				</Button>
				<Button
					variant="contained"
					fullWidth
					onClick={() => {
						nodecg.sendMessage('hlae:playerDeath', ExamplePlayerDeath);
					}}>
					Kill Basic
				</Button>
				<Button
					variant="contained"
					fullWidth
					onClick={() => {
						nodecg.sendMessage('hlae:playerDeath', LargePlayerDeath);
					}}>
					Kill Large
				</Button>
			</ButtonContainer>
		</ThemeProvider>
	);
};

render(<Test />, document.getElementById('test'));
