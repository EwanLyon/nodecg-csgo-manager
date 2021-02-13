// Couldnt get a clean solution to updating text fields without doing it one by one.

import React, { useRef, useState, useEffect } from 'react';
import { render } from 'react-dom';
import { useReplicant } from 'use-nodecg';

// React imports
import { theme } from '../theme';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { ThemeProvider, makeStyles, createStyles } from '@material-ui/styles';
import { TextField } from '@material-ui/core';
import { StyledToggleButton } from '../atoms/toggle-button';

// Interfaces
import { GameSettings as IGameSettings } from '../../../types/game-settings';

const useStyles = makeStyles(() =>
	createStyles({
		typography: {
			flexGrow: 1,
			lineHeight: '48px',
		},
		inputNumber: {
			'&::-webkit-inner-spin-button': {
				display: '"none"',
			},
			'&::-webkit-outer-spin-button': {
				display: '"none"',
			},
		},
	}),
);

export const GameSettings: React.FunctionComponent = () => {
	const [gameSettings, setGameSettings] = useReplicant<IGameSettings>(
		'gameSettings',
		{} as IGameSettings,
	);
	const lockButton = useRef<StyledToggleButton>(null);
	const [textFieldDisabled, setTextFieldDisabled] = useState(true);
	const classes = useStyles();
	const [editedSettings, setEditedSettings] = useState<IGameSettings>(gameSettings);

	function applyNewSettings(): void {
		if (!textFieldDisabled) {
			setGameSettings({
				bombPlantTime: editedSettings.bombPlantTime,
				bombTime: editedSettings.bombTime,
				noKitDefuseTime: editedSettings.noKitDefuseTime,
				kitDefuseTime: editedSettings.kitDefuseTime,
			});
		}

		setTextFieldDisabled(!textFieldDisabled);
	}

	useEffect(() => {
		setEditedSettings(gameSettings);
	}, [gameSettings]);

	useEffect(() => {
		if (lockButton.current) {
			lockButton.current.toggleButton(textFieldDisabled);
		}
	});

	return (
		<ThemeProvider theme={theme}>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
				}}>
				<Grid container spacing={1}>
					<Grid item xs={8}>
						<Typography className={classes.typography}>Plant Time</Typography>
					</Grid>
					<Grid item xs={4}>
						<TextField
							disabled={textFieldDisabled}
							type="number"
							size="small"
							variant="filled"
							id="plant-time"
							classes={{ root: classes.inputNumber }}
							value={editedSettings.bombPlantTime}
							onChange={(e): void => console.log(e)}
						/>
					</Grid>

					<Grid item xs={8}>
						<Typography className={classes.typography}>Bomb Time</Typography>
					</Grid>
					<Grid item xs={4}>
						<TextField
							disabled={textFieldDisabled}
							type="number"
							size="small"
							variant="filled"
							id="bomb-time"
							defaultValue={editedSettings.bombTime}
						/>
					</Grid>

					<Grid item xs={8}>
						<Typography className={classes.typography}>No Kit Defuse Time</Typography>
					</Grid>
					<Grid item xs={4}>
						<TextField
							disabled={textFieldDisabled}
							type="number"
							size="small"
							variant="filled"
							id="nkdefuse-time"
							value={editedSettings.noKitDefuseTime}
						/>
					</Grid>

					<Grid item xs={8}>
						<Typography className={classes.typography}>Kit Defused Time</Typography>
					</Grid>
					<Grid item xs={4}>
						<TextField
							disabled={textFieldDisabled}
							type="number"
							size="small"
							variant="filled"
							id="defuse-time"
							value={editedSettings.kitDefuseTime}
						/>
					</Grid>
				</Grid>
			</div>
			<StyledToggleButton
				initialText="Lock"
				toggleText="Unlock"
				value="gameSettingsButton"
				style={{ width: '100%', marginTop: '10px' }}
				onClick={applyNewSettings}
				ref={lockButton}
			/>
		</ThemeProvider>
	);
};

render(<GameSettings />, document.getElementById('game-settings'));
