import React from 'react';
import styled from 'styled-components';
import { Grid } from '@material-ui/core';

const TeamName = styled.span`
	width: 130px;
	white-space: nowrap;
`;
const MapName = styled.span`
	width: 90px;
	text-align: right;
`;

interface Props {
	team: string;
	map: string;
	ban?: boolean;
}

export const SelectedMap: React.FC<Props> = (props: Props) => {
	return (
		<Grid container justify="space-between" style={{ paddingLeft: 5 }}>
			<TeamName>{props.team}</TeamName>
			<em>{props.ban ? 'BAN' : 'PICK'}</em>
			<MapName>{props.map}</MapName>
		</Grid>
	);
};
