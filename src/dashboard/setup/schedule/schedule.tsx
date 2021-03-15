import React, { useState } from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';
import { theme } from '../../theme';
import { useReplicant } from 'use-nodecg';

import { TeamsPreset } from '../../../../types/team-preset';
import { teamPlayerPreset } from '../../../extension/example-data';
import { Match, Matches, NewMatch } from '../../../../types/matches';

import {
	Grid,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	TextField,
	Chip,
} from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import {
	DragDropContext,
	Droppable,
	Draggable,
	DraggingStyle,
	NotDraggingStyle,
	DropResult,
} from 'react-beautiful-dnd';
import { SingleMatch } from './singlematch';
import { GreenButton } from '../../atoms/styled-ui';

const GreenButtonExtra = styled(GreenButton)`
	min-width: 44px;
`;

const Divider = styled.div`
	height: 1px;
	width: 100%;
	background: #fff;
	margin: 10px;
`;

const SpacedChips = styled(Chip)`
	margin: 0 2px;
`;

const reorder = (list: unknown[], startIndex: number, endIndex: number) => {
	const result = Array.from(list);
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);

	return result;
};

const getItemStyle = (
	draggableStyle: DraggingStyle | NotDraggingStyle | undefined,
): React.CSSProperties => ({
	// Some basic styles to make the items look a bit nicer
	userSelect: 'none',
	margin: '0 0 6px 0',

	// Styles we need to apply on draggables
	...draggableStyle,
});

const DashSchedule: React.FC = () => {
	const [teamPresetsRep] = useReplicant<TeamsPreset>('teamPlayerPreset', teamPlayerPreset);
	const [matchesRep] = useReplicant<Matches>('matches', []);
	const [currentMatchRep] = useReplicant<Match | undefined>('currentMatch', undefined);

	const [teamA, setTeamA] = useState('');
	const [teamB, setTeamB] = useState('');
	const [time, setTime] = useState('');
	const [matchType, setMatchType] = useState('bo1');

	const teamsList = Object.entries(teamPresetsRep.teams).map(([key, team]) => {
		return (
			<MenuItem key={key} value={team.name}>
				<img
					style={{
						height: 20,
						width: 20,
						objectFit: 'scale-down',
						marginRight: 10,
					}}
					src={team.logo}
				/>
				{team.name}
			</MenuItem>
		);
	});

	teamsList.unshift(
		<MenuItem key={'empty'} value={''}>
			Empty
		</MenuItem>,
	);

	function AddGame() {
		const scheduleTime = time || '';
		nodecg.sendMessage('createNewMatch', { teamA, teamB, time: scheduleTime, matchType } as NewMatch);
	}

	function onDragEnd(result: DropResult) {
		// Dropped outside the list
		if (!result.destination) {
			return;
		}

		const items = reorder(matchesRep, result.source.index, result.destination.index);

		nodecg.sendMessage('updateMatchOrder', items);
	}

	return (
		<ThemeProvider theme={theme}>
			<Grid container>
				<Grid
					item
					container
					alignItems="center"
					justify="space-around"
					style={{ margin: '0 15px' }}>
					<Grid item xs={2}>
						<FormControl variant="filled" fullWidth>
							<InputLabel id="teamLabelA">Team A</InputLabel>
							<Select
								labelId="teamLabelA"
								value={teamA}
								onChange={(e): void => setTeamA(e.target.value as string)}>
								{teamsList}
							</Select>
						</FormControl>
					</Grid>
					<span style={{ marginLeft: 10, marginRight: 10 }}>VS</span>
					<Grid item xs={2}>
						<FormControl variant="filled" fullWidth>
							<InputLabel id="teamLabelB">Team B</InputLabel>
							<Select
								labelId="teamLabelB"
								value={teamB}
								onChange={(e): void => setTeamB(e.target.value as string)}>
								{teamsList}
							</Select>
						</FormControl>
					</Grid>
					<Grid item xs={2}>
						<TextField
							label="Time"
							value={time}
							style={{ margin: '0 10px' }}
							variant="outlined"
							onChange={(e): void => setTime(e.target.value as string)}
						/>
					</Grid>
					<SpacedChips
						label="Bo1"
						onClick={() => setMatchType('bo1')}
						variant={matchType === 'bo1' ? 'default' : 'outlined'}
					/>
					<SpacedChips
						label="Bo3"
						onClick={() => setMatchType('bo3')}
						variant={matchType === 'bo3' ? 'default' : 'outlined'}
					/>
					<SpacedChips
						label="Bo5"
						onClick={() => setMatchType('bo5')}
						variant={matchType === 'bo5' ? 'default' : 'outlined'}
					/>
					<GreenButtonExtra
						variant="contained"
						onClick={AddGame}
						disabled={!teamA || !teamB}>
						+
					</GreenButtonExtra>
				</Grid>
				<Divider />
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId="schedule">
						{(provided) => (
							<div
								ref={provided.innerRef}
								{...provided.droppableProps}
								style={{ width: '100%' }}>
								{matchesRep.map((match, index) => {
									return (
										<Draggable
											key={match.id}
											draggableId={match.id}
											index={index}>
											{(provided) => (
												<div
													ref={provided.innerRef}
													{...provided.draggableProps}
													style={getItemStyle(
														provided.draggableProps.style,
													)}>
													<SingleMatch
														handleProps={provided.dragHandleProps}
														match={match}
														current={currentMatchRep?.id === match.id}
													/>
												</div>
											)}
										</Draggable>
									);
								})}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			</Grid>
		</ThemeProvider>
	);
};

render(<DashSchedule />, document.getElementById('dash-schedule'));
