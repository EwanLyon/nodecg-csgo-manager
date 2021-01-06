import React, { useState } from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';
import { useReplicant } from 'use-nodecg';
import { theme } from '../../theme';

import { Grid, Select, Chip, FormControl, InputLabel, MenuItem } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
// import { Schedule } from '../types/schedule';
import {
	DragDropContext,
	Droppable,
	Draggable,
	DraggingStyle,
	NotDraggingStyle,
	DropResult,
} from 'react-beautiful-dnd';
import { ExtraMapData } from '../../../types/map-data';
import { DashVETOSingle } from './vetosingle';
import { TeamData as DummyTD } from '../../../extension/dummyData';
import { TeamData } from '../../../types/extra-data';
import { GreenButton } from '../../atoms/styled-ui';

const GreenButtonExtra = styled(GreenButton)`
	min-width: 44px;
`;

const SpacedChip = styled(Chip)`
	margin: 2px 0;
`;

const Divider = styled.div`
	height: 1px;
	width: 100%;
	background: #525f78;
	margin: 8px 0;
`;

const mapNames = ['Dust2', 'Inferno', 'Mirage', 'Nuke', 'Overpass', 'Train', 'Vertigo'];

const reorder = (list: any[], startIndex: number, endIndex: number) => {
	const result = Array.from(list);
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);

	return result;
};

const getItemStyle = (draggableStyle: DraggingStyle | NotDraggingStyle | undefined): React.CSSProperties => ({
	// Some basic styles to make the items look a bit nicer
	userSelect: 'none',
	margin: '0 10px 6px 10px',

	// Styles we need to apply on draggables
	...draggableStyle,
});

const DashVeto: React.FC = () => {
	// const [currentMatchRep] = useReplicant<string>('currentMatch', '');
	// const [scheduleRep] = useReplicant<Schedule>('schedule', []);
	const [teamOneRep] = useReplicant<TeamData>('teamOne', DummyTD);
	const [teamTwoRep] = useReplicant<TeamData>('teamTwo', DummyTD);
	const [vetoRep] = useReplicant<ExtraMapData[]>('mapInfo', []);
	const [teamSelected, setTeamSelected] = useState('');
	const [mapSelected, setMapSelected] = useState('');
	const [vetoType, setVetoType] = useState('Ban');

	// const scheduleIndex = scheduleRep.findIndex(game => game.id === currentMatchRep.toString());

	// if (scheduleIndex === -1) {
	// 	console.log('VETO: Could not find scheduled match');
	// 	return <>Could not find scheduled match to VETO (could probably do with a better ui tho)</>;
	// }

	// const scheduleGame = scheduleRep[scheduleIndex];

	const mapItems = mapNames.map(map => {
		const mapAlreadySelected = vetoRep.find(veto => (veto.map === map));
		return (
			<MenuItem key={map} value={map} disabled={Boolean(mapAlreadySelected)}>
				{map}
			</MenuItem>
		);
	});

	function onDragEnd(result: DropResult) {
		// Dropped outside the list
		if (!result.destination) {
			return;
		}

		const items = reorder(vetoRep, result.source.index, result.destination.index);

		nodecg.sendMessage('reorderMaps', items);
	}

	function AddMap(): void {
		// eslint-disable-next-line no-undef
		nodecg.sendMessage('addMap', {
			map: mapSelected,
			ban: vetoType === 'Ban',
			team: teamSelected
		} as ExtraMapData);
	}

	return (
		<ThemeProvider theme={theme}>
			<Grid container direction="column">
				<Grid
					item
					container
					alignItems="center"
					justify="space-between"
					style={{ padding: '0 15px' }}
					spacing={1}>
					<Grid item xs={4}>
						<FormControl variant="filled" fullWidth>
							<InputLabel id="teamVeto">Team</InputLabel>
							<Select
								labelId="teamVeto"
								value={teamSelected}
								onChange={(e): void => setTeamSelected(e.target.value as string)}>
								<MenuItem key={teamOneRep.name} value={teamOneRep.name}>
									<img
										style={{
											height: 20,
											width: 20,
											objectFit: 'scale-down',
											marginRight: 10,
										}}
										src={teamOneRep.teamURL}
									/>
									{teamOneRep.name}
								</MenuItem>
								<MenuItem key={teamTwoRep.name} value={teamTwoRep.name}>
									<img
										style={{
											height: 20,
											width: 20,
											objectFit: 'scale-down',
											marginRight: 10,
										}}
										src={teamTwoRep.teamURL}
									/>
									{teamTwoRep.name}
								</MenuItem>
								<MenuItem key="Server" value="Server">
									Server
								</MenuItem>
							</Select>
						</FormControl>
					</Grid>
					<Grid item container direction="column" justify="center" style={{ width: 'fit-content' }}>
						<SpacedChip
							label="Pick"
							onClick={() => setVetoType('Pick')}
							variant={vetoType === 'Pick' ? 'default' : 'outlined'}
						/>
						<SpacedChip
							label="Ban"
							onClick={() => setVetoType('Ban')}
							variant={vetoType === 'Ban' ? 'default' : 'outlined'}
						/>
					</Grid>
					<Grid item xs={4}>
						<FormControl variant="filled" fullWidth>
							<InputLabel id="mapVeto">Map</InputLabel>
							<Select
								labelId="mapVeto"
								value={mapSelected}
								onChange={(e): void => setMapSelected(e.target.value as string)}>
								{mapItems}
							</Select>
						</FormControl>
					</Grid>
					<GreenButtonExtra variant="contained" fullWidth onClick={AddMap}>+</GreenButtonExtra>
				</Grid>
				<Divider />
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId="schedule">
						{provided => (
							<div ref={provided.innerRef} {...provided.droppableProps} style={{ width: '100%' }}>
								{vetoRep.map((veto, index) => {
									return (
										<Draggable key={veto.map} draggableId={veto.map} index={index}>
											{provided => (
												<div
													ref={provided.innerRef}
													{...provided.draggableProps}
													style={getItemStyle(provided.draggableProps.style)}>
													<DashVETOSingle
														veto={veto}
														handleProps={provided.dragHandleProps}
														otherTeamName={
															veto.team === teamOneRep.name
																? teamTwoRep.name
																: teamOneRep.name
														}
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

render(<DashVeto />, document.getElementById('dash-veto'));
