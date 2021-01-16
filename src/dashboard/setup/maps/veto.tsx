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
import { MapInfo, Match } from '../../../types/matches';
import { DashVETOSingle } from './vetosingle';
import { GreenButton } from '../../atoms/styled-ui';

const NoMapError = styled.div`
	padding: 8px;
	text-align: center;
`;

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

const SelectNoMaxHeight = styled(Select)`
	& .MuiMenu-paper {
		max-height: 100%;
	}
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
	const [currentMatchRep] = useReplicant<Match | undefined>('currentMatch', undefined);
	const [teamSelected, setTeamSelected] = useState('');
	const [mapSelected, setMapSelected] = useState('');
	const [vetoType, setVetoType] = useState('Ban');

	if (!currentMatchRep) {
		console.log('VETO: Could not find current match scores.', currentMatchRep);
		return <NoMapError>No match selected</NoMapError>;
	}

	const mapItems = mapNames.map((map) => {
		const mapAlreadySelected = currentMatchRep.maps.find((matchMaps) => matchMaps.map === map);
		return (
			<MenuItem key={map} value={map} disabled={Boolean(mapAlreadySelected)}>
				{map}
			</MenuItem>
		);
	});

	function onDragEnd(result: DropResult) {
		// Dropped outside the list
		if (!result.destination || !currentMatchRep?.maps) {
			return;
		}

		const items = reorder(currentMatchRep?.maps, result.source.index, result.destination.index);

		nodecg.sendMessage('reorderMaps', items);
	}

	function AddMap(): void {
		if (!currentMatchRep) return;
		setTeamSelected(
			teamSelected === currentMatchRep.teamA.name ? currentMatchRep.teamB.name : currentMatchRep.teamA.name,
		);
		nodecg.sendMessage('addMap', {
			map: mapSelected,
			ban: vetoType === 'Ban',
			teamVeto: teamSelected,
			complete: false,
			firstHalf: { teamA: 0, teamB: 0 },
			secondHalf: { teamA: 0, teamB: 0 },
			side: '',
		} as MapInfo);
	}

	const canAddMap = teamSelected !== '' && mapSelected !== '';

	return (
		<ThemeProvider theme={theme}>
			<Grid container direction="column" style={{ padding: '8px 0' }}>
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
							<SelectNoMaxHeight
								labelId="teamVeto"
								value={teamSelected}
								onChange={(e): void => setTeamSelected(e.target.value as string)}>
								<MenuItem key={currentMatchRep.teamA.name} value={currentMatchRep.teamA.name}>
									<img
										style={{
											height: 20,
											width: 20,
											objectFit: 'scale-down',
											marginRight: 10,
										}}
										src={currentMatchRep.teamA.logo}
									/>
									{currentMatchRep.teamA.name}
								</MenuItem>
								<MenuItem key={currentMatchRep.teamB.name} value={currentMatchRep.teamB.name}>
									<img
										style={{
											height: 20,
											width: 20,
											objectFit: 'scale-down',
											marginRight: 10,
										}}
										src={currentMatchRep.teamB.logo}
									/>
									{currentMatchRep.teamB.name}
								</MenuItem>
								<MenuItem key="Server" value="Server">
									Server
								</MenuItem>
							</SelectNoMaxHeight>
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
					<GreenButtonExtra variant="contained" fullWidth onClick={AddMap} disabled={!canAddMap}>
						+
					</GreenButtonExtra>
				</Grid>
				<Divider />
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId="schedule">
						{(provided) => (
							<div ref={provided.innerRef} {...provided.droppableProps} style={{ width: '100%' }}>
								{currentMatchRep.maps.map((map, index) => {
									return (
										<Draggable key={map.map} draggableId={map.map} index={index}>
											{(provided) => (
												<div
													ref={provided.innerRef}
													{...provided.draggableProps}
													style={getItemStyle(provided.draggableProps.style)}>
													<DashVETOSingle
														veto={map}
														handleProps={provided.dragHandleProps}
														otherTeamName={
															map.teamVeto === currentMatchRep.teamA.name
																? currentMatchRep.teamB.name
																: currentMatchRep.teamA.name
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
