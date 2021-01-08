import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';

import {
	Grid,
	ExpansionPanel,
	TextField,
	ExpansionPanelSummary,
	ExpansionPanelDetails,
	FormControlLabel,
	Checkbox,
} from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { ExpandMore } from '@material-ui/icons';

interface Props {
	mapNo: number;
	mapName: string;
}

const ExpansionPanelStyled = styled(ExpansionPanel)`
	background: #525f78;
`;

const ExpansionDetailsStyled = styled(ExpansionPanelDetails)`
	background: #3c4a65;
`;

const SegmentText = styled.span`
	width: 56px;
	min-width: 56px;
`;

const ScoreText = styled(TextField)`
	width: 60px;
`;

const VerticalDivider = styled.div`
	width: 1px;
	height: 100%;
	background: #525f78;
	margin: 0 5px;
`;

export const DashMapScores: React.FC<Props> = (props: Props) => {
	const teamATotal =
		parseInt((document.getElementById(`${props.mapNo}A1-Score`) as HTMLInputElement)?.value || '0', 10) +
		parseInt((document.getElementById(`${props.mapNo}A2-Score`) as HTMLInputElement)?.value || '0', 10) +
		parseInt((document.getElementById(`${props.mapNo}AOT-Score`) as HTMLInputElement)?.value || '0', 10);

	const teamBTotal =
		parseInt((document.getElementById(`${props.mapNo}B1-Score`) as HTMLInputElement)?.value || '0', 10) +
		parseInt((document.getElementById(`${props.mapNo}B2-Score`) as HTMLInputElement)?.value || '0', 10) +
		parseInt((document.getElementById(`${props.mapNo}BOT-Score`) as HTMLInputElement)?.value || '0', 10);

	const score = `${teamATotal}-${teamBTotal}`;

	return (
		<ThemeProvider theme={theme}>
			<ExpansionPanelStyled>
				<ExpansionPanelSummary expandIcon={<ExpandMore />}>
					<div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
						<span>{props.mapName}</span>
						<span>{score}</span>
					</div>
				</ExpansionPanelSummary>
				<ExpansionDetailsStyled>
					<Grid container justify="center">
						<Grid item container alignItems="center" justify="space-around" style={{ margin: '5px 0' }}>
							<SegmentText>1<sup>st</sup> half</SegmentText>
							<ScoreText type="number" id={`${props.mapNo}A1-Score`} variant="outlined" />
							<VerticalDivider />
							<ScoreText type="number" id={`${props.mapNo}B1-Score`} variant="outlined" />
						</Grid>
						<Grid item container alignItems="center" justify="space-around" style={{ margin: '5px 0' }}>
							<SegmentText>2<sup>nd</sup> half</SegmentText>
							<ScoreText type="number" id={`${props.mapNo}A2-Score`} variant="outlined" />
							<VerticalDivider />
							<ScoreText type="number" id={`${props.mapNo}B2-Score`} variant="outlined" />
						</Grid>
						<Grid item container alignItems="center" justify="space-around" style={{ margin: '5px 0' }}>
							<SegmentText>OT</SegmentText>
							<ScoreText type="number" id={`${props.mapNo}AOT-Score`} variant="outlined" />
							<VerticalDivider />
							<ScoreText type="number" id={`${props.mapNo}BOT-Score`} variant="outlined" />
						</Grid>
						<FormControlLabel
							control={
								<Checkbox id={`${props.mapNo}-Complete`} />
							}
							label="Complete"
							labelPlacement="start"
						/>
					</Grid>
				</ExpansionDetailsStyled>
			</ExpansionPanelStyled>
		</ThemeProvider>
	);
};
