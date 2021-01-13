import React, { ChangeEvent } from 'react';
import styled from 'styled-components';

import { Match } from '../../types/matches';

import { Select, MenuItem } from '@material-ui/core';

const FixtureMatchContainer = styled.div``;

interface Props {
	match: Match | undefined;
	round: number;
	matchNo: number;
	allMatchesMenuItems: JSX.Element[];
	changeMatch: (id: string, round: number, match: number) => void;
}

export const FixtureMatch: React.FC<Props> = (props: Props) => {
	function changeMatch(event: ChangeEvent<{ name?: string | undefined; value: unknown }>) {
		props.changeMatch(event.target.value as string, props.round, props.matchNo);
	}

	return (
		<FixtureMatchContainer>
			<Select
				onChange={changeMatch}
				value={props.match?.id || ''}
				style={{ minWidth: 150, maxWidth: 250, width: '100%' }}
				variant="filled">
				<MenuItem key="empty" value="">
					<i>No Match</i>
				</MenuItem>
				{props.allMatchesMenuItems}
			</Select>
		</FixtureMatchContainer>
	);
};
