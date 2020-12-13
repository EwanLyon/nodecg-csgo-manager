import React, { useState } from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';
import {
	Grid,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	ThemeProvider,
	Switch,
	Button,
	IconButton
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { useReplicant } from 'use-nodecg';
import { TeamData } from '../../../types/extra-data';
import { ExtraMapData } from '../../../types/map-data';
import { TeamData as DummyTD } from '../../../extension/dummyData';
import { MapData } from '../../map-data';
import { theme } from '../../theme';
import { SelectedMap } from './selected-map';
import { shadow2 } from '../../atoms/shadows';

const SelectedMapContainer = styled(Grid)`
	background-color: #435370;
	box-shadow: ${shadow2};
	margin: 3px 0;
`;

const Maps: React.FC = () => {
	const [teamOneRep] = useReplicant<TeamData>('teamOne', DummyTD);
	const [teamTwoRep] = useReplicant<TeamData>('teamTwo', DummyTD);
	const [mapDataRep] = useReplicant<ExtraMapData[]>('mapInfo', []);

	const [localBan, setLocalBan] = useState(false);
	const [localTeam, setLocalTeam] = useState('');
	const [localMap, setLocalMap] = useState('');

	const mapList = Object.keys(MapData).map(map => {
		return (
			<MenuItem key={map} value={map}>
				{map}
			</MenuItem>
		);
	});
	mapList.push(
		<MenuItem key="0" value="">
			<em>Unselected</em>
		</MenuItem>
	);

	function removeMap(index: number): void {
		// eslint-disable-next-line no-undef
		nodecg.sendMessage('removeMap', mapDataRep[index].map);
	}

	const selectedMaps = mapDataRep.map((selMap, index) => {
		let teamName;
		if (selMap.team === '1') {
			teamName = teamOneRep.name;
		} else if (selMap.team === '2') {
			teamName = teamTwoRep.name;
		} else {
			teamName = 'Server';
		}

		return (
			<SelectedMapContainer container key={index} alignItems="center">
				<Grid item xs>
					<SelectedMap team={teamName} map={selMap.map} ban={selMap.ban} />
				</Grid>
				<IconButton onClick={(): void => removeMap(index)}>
					<DeleteIcon />
				</IconButton>
			</SelectedMapContainer>
		);
	});

	function AddMap(): void {
		let teamSelected;
		if (localTeam === teamOneRep.name) {
			teamSelected = '1';
		} else if (localTeam === teamTwoRep.name) {
			teamSelected = '2';
		} else {
			teamSelected = 'Server';
		}

		// eslint-disable-next-line no-undef
		nodecg.sendMessage('addMap', {
			map: localMap,
			ban: localBan,
			team: teamSelected
		} as ExtraMapData);
	}

	return (
		<ThemeProvider theme={theme}>
			<Grid container alignItems="center" direction="column">
				{selectedMaps}
				<hr style={{ width: '100%' }} />
				<Grid container alignItems="center">
					{/* Team selection */}
					<FormControl variant="filled" style={{ flexGrow: 1 }} size="small">
						<InputLabel id="teamSelection">Team</InputLabel>
						<Select
							labelId="teamSelection"
							value={localTeam}
							onChange={(e): void => {
								setLocalTeam(e.target.value as string);
							}}
						>
							<MenuItem key={teamOneRep.name} value={teamOneRep.name}>
								{teamOneRep.name}
							</MenuItem>
							<MenuItem key={teamTwoRep.name} value={teamTwoRep.name}>
								{teamTwoRep.name}
							</MenuItem>
							<MenuItem key="Server" value="Server">
								Server
							</MenuItem>
						</Select>
					</FormControl>
					{/* Pick or Ban */}
					<Grid item>
						Pick
						<Switch checked={localBan} onChange={(): void => setLocalBan(!localBan)} />
						Ban
					</Grid>

					{/* Map selection */}
					<FormControl variant="filled" style={{ flexGrow: 1 }} size="small">
						<InputLabel id="mapSelection">Map</InputLabel>
						<Select
							labelId="mapSelection"
							value={localMap}
							onChange={(e): void => {
								setLocalMap(e.target.value as string);
							}}
						>
							{mapList}
						</Select>
					</FormControl>
				</Grid>
				<br />
				<Button onClick={AddMap} variant="contained">
					Add
				</Button>
			</Grid>
		</ThemeProvider>
	);
};

render(<Maps />, document.getElementById('maps'));
