import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useReplicant } from 'use-nodecg';

import { Asset } from '../../types/nodecg';

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from '@material-ui/core';
import { Tournament, TournamentEdit } from '../../types/tournament';

interface Props {
	tournament: Tournament | undefined;
	open: boolean;
	onClose: () => void;
}

const WiderDialog = styled(Dialog)`
	.MuiDialog-paper {
		min-width: 25%;
	}
`;

export const EditTournament: React.FC<Props> = (props: Props) => {
	const [tournamentLogosRep] = useReplicant<Asset[]>('assets:tournamentLogos', []);
	const [tournamentName, setTournamentName] = useState(props?.tournament?.name);
	const [selectedLogo, setSelectedLogo] = useState(props?.tournament?.logo);
	const [selectedFixture, setSelectedFixture] = useState(
		props?.tournament?.fixture.type as string,
	);
	const [fixtureTeams, setFixtureTeams] = useState('2');

	// Figure out what to fill in for size
	useEffect(() => {
		if (!props.tournament) return;

		if (props.tournament.fixture.type === 'single-elimination') {
			setFixtureTeams((props.tournament.fixture.matches[0].length * 2).toString());
		} else if (props.tournament.fixture.type === 'double-elimination') {
			setFixtureTeams((props.tournament.fixture.winnerMatches[0].length * 2).toString());
		}
	}, [props.tournament]);

	if (!props.tournament) return <></>;

	const tournamentLogos = tournamentLogosRep.map((logo) => {
		return (
			<MenuItem key={logo.sum} value={logo.url}>
				<img
					style={{
						height: 20,
						width: 20,
						objectFit: 'scale-down',
						marginRight: 10,
					}}
					src={logo.url}
				/>
				{logo.name}
			</MenuItem>
		);
	});

	function editTournament() {
		if (!props.tournament) return;

		const editedTournament: TournamentEdit = {
			id: props.tournament.id,
			name: tournamentName || '',
			logo: selectedLogo || '',
			fixtureType: selectedFixture,
			size: parseInt(fixtureTeams, 10),
		};

		nodecg.sendMessage('editTournament', editedTournament);
		props.onClose();
	}

	function deleteTournament() {
		nodecg.sendMessage('deleteTournament', props.tournament?.id);
		props.onClose();
	}

	return (
		<WiderDialog
			onClose={props.onClose}
			aria-labelledby="create-tournament-dialog"
			open={props.open}>
			<DialogTitle id="create-tournament-dialog" style={{ minWidth: '25%' }}>
				Create Tournament
			</DialogTitle>
			<DialogContent dividers style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
				<TextField
					label="Name"
					variant="filled"
					value={tournamentName}
					onChange={(e) => setTournamentName(e.target.value)}
					required
				/>
				<FormControl variant="filled">
					<InputLabel id="tournamentLogoSelect">Logo</InputLabel>
					<Select
						labelId="tournamentLogoSelect"
						value={selectedLogo}
						onChange={(e): void => setSelectedLogo(e.target.value as string)}>
						<MenuItem key="empty" value="">
							<i>No Logo</i>
						</MenuItem>
						{tournamentLogos}
					</Select>
				</FormControl>
				<FormControl variant="filled" required>
					<InputLabel id="tournamentFixtureStyle">Fixture style</InputLabel>
					<Select
						labelId="tournamentFixtureStyle"
						value={selectedFixture}
						onChange={(e): void => setSelectedFixture(e.target.value as string)}>
						<MenuItem key="empty" value="">
							<i>No fixture type</i>
						</MenuItem>
						<MenuItem key="single-elim" value="single-elimination">
							Single-elimination bracket
						</MenuItem>
						<MenuItem key="double-elim" value="double-elimination">
							Double-elimination bracket
						</MenuItem>
					</Select>
				</FormControl>
				<FormControl variant="filled" required>
					<InputLabel id="tournamentFixtureTeams"># of teams</InputLabel>
					<Select
						labelId="tournamentFixtureTeams"
						value={fixtureTeams}
						onChange={(e): void => setFixtureTeams(e.target.value as string)}>
						<MenuItem key="empty" value="2">
							2
						</MenuItem>
						<MenuItem key="empty" value="4">
							4
						</MenuItem>
						<MenuItem key="empty" value="8">
							8
						</MenuItem>
						<MenuItem key="empty" value="16">
							16
						</MenuItem>
						<MenuItem key="empty" value="32">
							32
						</MenuItem>
					</Select>
				</FormControl>
			</DialogContent>
			<DialogActions style={{ justifyContent: 'space-between' }}>
				<Button onClick={deleteTournament}>Delete</Button>
				<div>
					<Button onClick={props.onClose}>Cancel</Button>
					<Button
						onClick={editTournament}
						disabled={
							tournamentName === '' || selectedFixture === '' || fixtureTeams === ''
						}>
						Apply
					</Button>
				</div>
			</DialogActions>
		</WiderDialog>
	);
};
