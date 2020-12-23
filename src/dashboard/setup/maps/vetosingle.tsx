import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';

import { ExtraMapData } from '../../../types/map-data';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';

import { Chip, Grid } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { GrabHandles } from '../../atoms/grabhandle';
import { FitText, Text as FitTextText } from '../../atoms/fit-text';
import { RedButton } from '../../atoms/styled-ui';

const VETOSingleContainer = styled.div`
	background: #40495f;
	border-radius: 7px;
	padding: 10px;
	box-shadow: 0px 1px 8px rgba(0, 0, 0, 0.2), 0px 3px 3px rgba(0, 0, 0, 0.12), 0px 3px 4px rgba(0, 0, 0, 0.14);
`;

const TeamName = styled(FitText)`
	min-width: 100px;
	max-width: 100px;

	justify-content: flex-start !important;
	& > ${FitTextText} {
		transform-origin: left !important;
	}
`;

const ChosenText = styled.span`
	font-style: italic;
`;

const MapText = styled.span`
	width: 68px;
	text-align: right;
`;

const RedButtonExtra = styled(RedButton)`
	min-width: 44px;
`;

const Divider = styled.div`
	height: 1px;
	width: 100%;
	background: #525f78;
	margin: 8px 0;
`;

interface Props {
	veto: ExtraMapData;
	handleProps: DraggableProvidedDragHandleProps | undefined;
	otherTeamName: string;
}

export const DashVETOSingle: React.FC<Props> = (props: Props) => {
	let sidePicker = <></>;

	if (!props.veto.ban) {
		sidePicker = (
			<ThemeProvider theme={theme}>
				<Divider />
				<Grid item container justify="space-around">
					<Chip
						label={`${props.otherTeamName} pick CT`}
						onClick={() => nodecg.sendMessage('setVetoSide', { mapName: props.veto.map, side: 'CT' })}
						variant={props.veto.side === 'CT' ? 'default' : 'outlined'}
					/>
					<Chip
						label={`${props.otherTeamName} pick T`}
						onClick={() => nodecg.sendMessage('setVetoSide', { mapName: props.veto.map, side: 'T' })}
						variant={props.veto.side === 'T' ? 'default' : 'outlined'}
					/>
					<Chip
						label={'Knife'}
						onClick={() => nodecg.sendMessage('setVetoSide', { mapName: props.veto.map, side: 'Knife' })}
						variant={props.veto.side === 'Knife' ? 'default' : 'outlined'}
					/>
				</Grid>
			</ThemeProvider>
		);
	}

	function removeVeto() {
		nodecg.sendMessage('removeVetoMap', props.veto.map);
	}

	return (
		<VETOSingleContainer>
			<Grid container direction="column">
				<Grid item container alignItems="center" justify="space-between">
					<GrabHandles handleProps={props.handleProps} />
					<TeamName text={props.veto.team}></TeamName>
					<ChosenText>{props.veto.ban ? 'Ban' : 'Pick'}</ChosenText>
					<MapText>{props.veto.map}</MapText>
					<RedButtonExtra variant="contained" onClick={removeVeto}>‒</RedButtonExtra>
				</Grid>
				{sidePicker}
			</Grid>
		</VETOSingleContainer>
	);
};
