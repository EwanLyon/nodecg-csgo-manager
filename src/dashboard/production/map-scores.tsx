import React, { useState } from 'react';
import styled from 'styled-components';
import { TextField, Button, Grid, ThemeProvider } from '@material-ui/core';
import { shadow2 } from '../atoms/shadows';
import { useReplicant } from 'use-nodecg';
import { render } from 'react-dom';
import { ExtraMapData } from '../../types/map-data';
import { TeamData } from '../../types/extra-data';
import { TeamData as DummyTD } from '../../extension/dummyData';
import { theme } from '../theme';

const SelectedMapContainer = styled(Grid)`
	background-color: #435370;
	box-shadow: ${shadow2};
	margin: 3px 0;
	height: 64px;
`;

interface LocalScores {
	teamOneScore: number;
	teamTwoScore: number;
}

export const MapScores: React.FC = () => {
	const [teamOneRep] = useReplicant<TeamData>('teamOne', DummyTD);
	const [teamTwoRep] = useReplicant<TeamData>('teamTwo', DummyTD);
	const [mapDataRep, setMapDataRep] = useReplicant<ExtraMapData[]>('mapInfo', []);
	const [localMapScores, setLocalMapScores] = useState<{ [key: string]: LocalScores }>({});

	function setTeamScore(score: number, map: string, teamTwo = false): void {
		const oldScores = localMapScores;
		if (teamTwo) {
			oldScores[map].teamTwoScore = score;
		} else {
			oldScores[map].teamOneScore = score;
		}

		setLocalMapScores(oldScores);
	}

	const pickedMaps = mapDataRep.map(selMap => {
		if (selMap.ban) {
			return undefined;
		}

		if (typeof localMapScores[selMap.map] === 'undefined') {
			localMapScores[selMap.map] = { teamOneScore: 0, teamTwoScore: 0 };
		}

		return (
			<SelectedMapContainer container alignItems="center" justify="space-evenly" key={selMap.map}>
				<span style={{ width: 100 }}>{selMap.map}</span>
				<div>
					<TextField
						variant="outlined"
						size="small"
						label={`${teamOneRep.name}`}
						InputLabelProps={{
							shrink: true
						}}
						type="number"
						style={{ width: 80 }}
						onChange={(e): void => setTeamScore(parseInt(e.target.value, 10), selMap.map)}
					/>
					<TextField
						variant="outlined"
						size="small"
						label={`${teamTwoRep.name}`}
						InputLabelProps={{
							shrink: true
						}}
						type="number"
						style={{ width: 80, marginLeft: 10 }}
						onChange={(e): void => setTeamScore(parseInt(e.target.value, 10), selMap.map, true)}
					/>
				</div>
			</SelectedMapContainer>
		);
	});

	function UpdateScores(): void {
		const oldMapData = mapDataRep;
		for (const [key, scores] of Object.entries(localMapScores)) {
			const mapIndex = oldMapData.findIndex(map => map.map === key);
			oldMapData[mapIndex].teamOneScore = scores.teamOneScore;
			oldMapData[mapIndex].teamTwoScore = scores.teamTwoScore;
		}

		setMapDataRep(oldMapData);
	}

	return (
		<ThemeProvider theme={theme}>
			<Grid container direction="column">
				<span>Currently has to be manually set</span>
				{pickedMaps}
				<Button onClick={UpdateScores} variant="contained">
					Update
				</Button>
			</Grid>
		</ThemeProvider>
	);
};

render(<MapScores />, document.getElementById('map-scores'));
