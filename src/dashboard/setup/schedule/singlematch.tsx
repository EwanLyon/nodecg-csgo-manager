import React from 'react';
import styled from 'styled-components';

import { Schedule } from '../../../types/schedule';

import { GrabHandles } from '../../atoms/grabhandle';
import { RedButton } from '../../atoms/styled-ui';
import { FitText } from '../../atoms/fit-text';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';

const RedButtonExtra = styled(RedButton)`
	min-width: 44px;
`;

const SingleMatchContainer = styled.div`
	background: #40495f;
	display: flex;
	align-items: center;
	justify-content: space-around;
	box-sizing: border-box;
	border: ${(props: ActiveProps) => (props.active ? '3px solid #DDFF57' : '')};
	width: 100%;
	height: 80px;
`;

const TeamsContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const TeamBoxContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-around;
`;

const TeamImage = styled.img`
	height: 42px;
	width: auto;
	max-width: 42px;
`;

const TeamName = styled(FitText)`
	font-size: 18px;
	width: 100px;
`;

interface Props {
	handleProps: DraggableProvidedDragHandleProps | undefined;
	game: Schedule[0];
	current?: boolean;
}

interface TeamBoxProps {
	team: Schedule[0]['teamA'];
}

interface ActiveProps {
	active?: boolean;
}

const TeamBox: React.FC<TeamBoxProps> = (props: TeamBoxProps) => {
	return (
		<TeamBoxContainer>
			<TeamImage src={props.team.logo} />
			<TeamName text={props.team.name} />
		</TeamBoxContainer>
	);
};

export const SingleMatch: React.FC<Props> = (props: Props) => {
	function RemoveGame() {
		nodecg.sendMessage('removeScheduleGame', props.game.id);
	}

	return (
		<SingleMatchContainer active={props.current}>
			<GrabHandles handleProps={props.handleProps} />
			<TeamsContainer>
				<TeamBox team={props.game.teamA} />
				<span style={{ margin: '0 5px', fontSize: 28 }}>VS</span>
				<TeamBox team={props.game.teamB} />
			</TeamsContainer>
			<span style={{ margin: '0 10px', fontSize: 32 }}>{props.game.time}</span>
			<span style={{ margin: '0 10px', fontSize: 23, color: '#bbb', textTransform: 'capitalize' }}>
				{props.game.matchType}
			</span>
			<RedButtonExtra variant="contained" size="small" onClick={RemoveGame}>
				‒
			</RedButtonExtra>
		</SingleMatchContainer>
	);
};
