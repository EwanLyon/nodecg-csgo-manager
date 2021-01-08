import React, { useState } from 'react';
import { render } from 'react-dom';
import { useReplicant } from 'use-nodecg';
import styled from 'styled-components';
import { theme } from '../../theme';

import { Schedule } from '../../../types/schedule';
import { ExtraMapData } from '../../../types/map-data';
import { MatchScores, MatchScoresItem, Score } from '../../../types/matchScores';

import { ThemeProvider } from '@material-ui/styles';
import { Grid, Button, Chip } from '@material-ui/core';
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import { DashMapScores } from './mapscores';

const Divider = styled.div`
	height: 1px;
	width: 100%;
	background: #525f78;
	margin: 8px 0;
`;

const TeamBoxContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-around;
`;

const TeamImage = styled.img`
	height: 55px;
	width: auto;
	max-width: 55px;
`;

const TeamName = styled.span`
	font-size: 18px;
	font-weight: 600;
`;

const SpacedChip = styled(Chip)`
	margin: 2px;
`;

interface TeamBoxProps {
	name: string;
	logo: string;
}

const TeamBox: React.FC<TeamBoxProps> = (props: TeamBoxProps) => {
	return (
		<TeamBoxContainer>
			<TeamImage src={props.logo} />
			<TeamName>{props.name}</TeamName>
		</TeamBoxContainer>
	);
};

const statusTypes = ['Soon', 'Playing', 'Half Time', 'Over Time', 'Final Score', 'Technical Break'];

const DashCurrentMatch: React.FC = () => {
	const [scheduleRep] = useReplicant<Schedule>('schedule', []);
	const [currentMatchRep] = useReplicant<string>('currentMatch', '');
	const [vetoRep] = useReplicant<ExtraMapData[]>('mapInfo', []);
	const [matchScoresRep] = useReplicant<MatchScores>('matchScores', []);
	const [currentStatus, setCurrentStatus] = useState('Soon');

	// Why I have to put .toString() after what should be a string is fucking beyond me
	const currentMatchIndex = scheduleRep.findIndex(game => game.id === currentMatchRep.toString());
	const currentMatch = scheduleRep[currentMatchIndex];

	// -1: Error, 0: Start, 1: "Middle", 2: End, 3: Only game
	let startOrEnd = 1;
	if (currentMatchIndex === -1) {
		startOrEnd = -1;
	} else if (scheduleRep.length === 1) {
		startOrEnd = 3;
	} else if (currentMatchIndex === 0) {
		startOrEnd = 0;
	} else if (currentMatchIndex === scheduleRep.length - 1) {
		startOrEnd = 2;
	}

	const pickedMaps = vetoRep.filter(veto => veto.matchId === currentMatchRep.toString() && !veto.ban);

	const matchScoresIndex = matchScoresRep.findIndex(match => match.id === currentMatchRep.toString());
	// Select correct status chip
	if (matchScoresIndex !== -1 && matchScoresRep[matchScoresIndex].status !== currentStatus) {
		setCurrentStatus(matchScoresRep[matchScoresIndex].status);
	}

	// Fill in score inputs
	for (let i = 0; i < pickedMaps.length; i++) {
		if (matchScoresRep.length === 0) {
			break;
		}

		if (typeof matchScoresRep[matchScoresIndex] === undefined) {
			// Made new match scores from dashboard... this shouldn't happen unless you're a dev
			nodecg.sendMessage('createNewMatchScores', currentMatchRep);
			break;
		}

		if (matchScoresRep[matchScoresIndex].maps[i]) {
			const mapScores = matchScoresRep[matchScoresIndex].maps[i];

			// In a try catch because if a map is introduced via veto then it will try
			// and fill inputs that aren't created
			try {
				if (mapScores.firstHalf.teamA !== 0 || mapScores.firstHalf.teamB !== 0) {
					(document.getElementById(
						`${i}A1-Score`,
					) as HTMLInputElement).value = mapScores.firstHalf.teamA.toString();
					(document.getElementById(
						`${i}B1-Score`,
					) as HTMLInputElement).value = mapScores.firstHalf.teamB.toString();
				} else {
					(document.getElementById(`${i}A1-Score`) as HTMLInputElement).value = '';
					(document.getElementById(`${i}B1-Score`) as HTMLInputElement).value = '';
				}

				if (mapScores.secondHalf.teamA !== 0 || mapScores.secondHalf.teamB !== 0) {
					(document.getElementById(
						`${i}A2-Score`,
					) as HTMLInputElement).value = mapScores.secondHalf.teamA.toString();
					(document.getElementById(
						`${i}B2-Score`,
					) as HTMLInputElement).value = mapScores.secondHalf.teamB.toString();
				} else {
					(document.getElementById(`${i}A2-Score`) as HTMLInputElement).value = '';
					(document.getElementById(`${i}B2-Score`) as HTMLInputElement).value = '';
				}

				if (mapScores.ot) {
					(document.getElementById(
						`${i}AOT-Score`,
					) as HTMLInputElement).value = mapScores.ot.teamA.toString();
					(document.getElementById(
						`${i}BOT-Score`,
					) as HTMLInputElement).value = mapScores.ot.teamB.toString();
				} else {
					(document.getElementById(`${i}AOT-Score`) as HTMLInputElement).value = '';
					(document.getElementById(`${i}BOT-Score`) as HTMLInputElement).value = '';
				}
			} catch (error) {
				console.log(
					'This error is from the current matches dashboard.\nIf it is complaining about .value being null then that is ok.\nIf not then that is not ok :). Err => ',
					error,
				);
			}
		} else {
			// Same reason as try catch above :(
			try {
				// I don't like repeating the set empty inputs bit but idk
				(document.getElementById(`${i}A1-Score`) as HTMLInputElement).value = '';
				(document.getElementById(`${i}B1-Score`) as HTMLInputElement).value = '';
				(document.getElementById(`${i}A2-Score`) as HTMLInputElement).value = '';
				(document.getElementById(`${i}B2-Score`) as HTMLInputElement).value = '';
				(document.getElementById(`${i}AOT-Score`) as HTMLInputElement).value = '';
				(document.getElementById(`${i}BOT-Score`) as HTMLInputElement).value = '';
			} catch (error) {
				console.log(
					`This error is from the current matches dashboard.
				If it is complaining about .value being null then that is ok.
				If not then that is not ok :). Err => `,
					error,
				);
			}
		}
	}

	function NextMatch() {
		nodecg.sendMessage('nextMatch');
	}

	function PrevMatch() {
		nodecg.sendMessage('prevMatch');
	}

	function UpdateScore() {
		const allMaps: MatchScoresItem['maps'] = [];
		for (let i = 0; i < pickedMaps.length; i++) {
			const fakeScores: Score = { teamA: 0, teamB: 0 };
			const singleMap: MatchScoresItem['maps'][0] = {
				map: pickedMaps[i].map,
				firstHalf: fakeScores,
				secondHalf: fakeScores,
				complete: (document.getElementById(`${i}-Complete`) as HTMLInputElement).checked,
			};

			// Get all inputs
			const [teamA1, teamB1, teamA2, teamB2, teamAOT, teamBOT] = [
				parseInt((document.getElementById(`${i}A1-Score`) as HTMLInputElement).value, 10),
				parseInt((document.getElementById(`${i}B1-Score`) as HTMLInputElement).value, 10),
				parseInt((document.getElementById(`${i}A2-Score`) as HTMLInputElement).value, 10),
				parseInt((document.getElementById(`${i}B2-Score`) as HTMLInputElement).value, 10),
				parseInt((document.getElementById(`${i}AOT-Score`) as HTMLInputElement).value, 10),
				parseInt((document.getElementById(`${i}BOT-Score`) as HTMLInputElement).value, 10),
			];

			// I think they were being anger at being undefined
			if (teamA1 >= 0 && teamB1 >= 0) {
				singleMap.firstHalf = {
					teamA: teamA1,
					teamB: teamB1,
				};
			}

			if (teamA2 >= 0 && teamB2 >= 0) {
				singleMap.secondHalf = {
					teamA: teamA2,
					teamB: teamB2,
				};
			}

			if (teamAOT >= 0 && teamBOT >= 0) {
				singleMap.ot = {
					teamA: teamAOT,
					teamB: teamBOT,
				};
			}

			allMaps.push(singleMap);
		}

		nodecg.sendMessage('updateScore', allMaps);
	}

	const updateStatus = (status: string) => () => {
		console.log(status);
		nodecg.sendMessage('updateStatus', status);
	};

	return (
		<ThemeProvider theme={theme}>
			<Grid container direction="column" justify="center">
				<Grid item container justify="space-between" style={{ padding: '0 15px' }}>
					<Button variant="contained" onClick={PrevMatch} disabled={[-1, 0, 3].includes(startOrEnd)}>
						<ChevronLeft /> Prev
					</Button>
					<Button variant="contained" onClick={NextMatch} disabled={[-1, 2, 3].includes(startOrEnd)}>
						Next <ChevronRight />
					</Button>
				</Grid>
				<Divider />
				<Grid item container alignItems="center" justify="center">
					<TeamBox name={currentMatch?.teamA.name} logo={currentMatch?.teamA.logo || ''} />
					<span style={{ margin: '0 10px' }}>VS</span>
					<TeamBox name={currentMatch?.teamB.name} logo={currentMatch?.teamB.logo || ''} />
				</Grid>

				<Grid item container justify="center" style={{ margin: '15px 0', padding: '0 8px' }}>
					{statusTypes.map(status => {
						return (
							<SpacedChip
								key={status}
								label={status}
								onClick={updateStatus(status)}
								variant={currentStatus === status ? 'default' : 'outlined'}
							/>
						);
					})}
				</Grid>

				{pickedMaps.map((veto, index) => {
					if (veto.matchId === currentMatchRep && !veto.ban) {
						return <DashMapScores key={index} mapNo={index} mapName={veto.map} />;
					}

					return null;
				})}
				<Button onClick={UpdateScore} variant="contained" style={{ margin: '8px 15px', marginBottom: 0 }}>
					Update Scores
				</Button>
			</Grid>
		</ThemeProvider>
	);
};

render(<DashCurrentMatch />, document.getElementById('dash-currentmatch'));
