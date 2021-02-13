import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';
import { useReplicant } from 'use-nodecg';
import { theme } from '../theme';

import {
	Tournaments,
	SingleElimination as ISingleElimination,
	DoubleElimination as IDoubleElimination,
} from '../../../types/tournament';

import {
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	ThemeProvider,
} from '@material-ui/core';
import { CreateTournament } from './create-tournament';
import { SingleElimination } from './single-elimination';
import { DoubleElimination } from './double-elimination';
import { EditTournament } from './edit-tournament';

const SelectionMenu = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 32px 0;
	gap: 16px;
`;

const Fixture: React.FC = () => {
	const [tournamentsRep] = useReplicant<Tournaments>('tournaments', {});
	const [selectedTournament, setSelectedTournament] = useState('');
	const [createTournamentDialog, setCreateTournamentDialog] = React.useState(false);
	const [editTournamentDialog, setEditTournamentDialog] = React.useState(false);
	const [currentTournamentRep] = useReplicant<string>('currentTournament', '');

	useEffect(() => {
		if (currentTournamentRep) {
			setSelectedTournament(currentTournamentRep);
		} else {
			const mostRecentTournament = Object.keys(tournamentsRep)[
				Object.keys(tournamentsRep).length - 1
			];
			setSelectedTournament(mostRecentTournament);
		}
	}, [tournamentsRep, currentTournamentRep]);

	function handleCreateOpen() {
		setCreateTournamentDialog(true);
	}

	function handleEditOpen() {
		setEditTournamentDialog(true);
	}

	function handleClose() {
		setCreateTournamentDialog(false);
		setEditTournamentDialog(false);
	}

	function setActiveTournament() {
		nodecg.sendMessage('setActiveTournament', selectedTournament);
	}

	const tournamentItems = Object.entries(tournamentsRep).map(([key, tournament]) => {
		return (
			<MenuItem key={key} value={tournament.id}>
				{tournament.logo && (
					<img
						style={{
							height: 20,
							width: 20,
							objectFit: 'scale-down',
							marginRight: 10,
						}}
						src={tournament.logo}
					/>
				)}
				{tournament.name}
			</MenuItem>
		);
	});

	let fixtureElement = <></>;
	switch (tournamentsRep[selectedTournament]?.fixture.type) {
		case 'single-elimination':
			fixtureElement = (
				<SingleElimination
					tournamentId={selectedTournament}
					data={tournamentsRep[selectedTournament].fixture as ISingleElimination}
				/>
			);
			break;

		case 'double-elimination':
			fixtureElement = (
				<DoubleElimination
					tournamentId={selectedTournament}
					data={tournamentsRep[selectedTournament].fixture as IDoubleElimination}
				/>
			);
			break;

		default:
			break;
	}

	return (
		<ThemeProvider theme={theme}>
			<SelectionMenu>
				<FormControl variant="filled" style={{ minWidth: 200 }}>
					<InputLabel id="tournamentSelect">Tournament</InputLabel>
					<Select
						labelId="tournamentSelect"
						value={selectedTournament}
						onChange={(e): void => setSelectedTournament(e.target.value as string)}>
						<MenuItem key="empty" value="">
							<i>No Tournament</i>
						</MenuItem>
						{tournamentItems}
					</Select>
				</FormControl>
				<Button variant="contained" onClick={handleCreateOpen}>
					New Tournament
				</Button>
				<Button
					variant="contained"
					onClick={handleEditOpen}
					disabled={!tournamentsRep[selectedTournament]}>
					Edit Tournament
				</Button>
				<Button
					variant="contained"
					onClick={setActiveTournament}
					disabled={selectedTournament === currentTournamentRep}>
					Set Active
				</Button>
			</SelectionMenu>
			<hr />
			{fixtureElement}
			<CreateTournament onClose={handleClose} open={createTournamentDialog} />
			<EditTournament
				onClose={handleClose}
				open={editTournamentDialog}
				tournament={tournamentsRep[selectedTournament]}
			/>
		</ThemeProvider>
	);
};

render(<Fixture />, document.getElementById('dash-fixture'));
