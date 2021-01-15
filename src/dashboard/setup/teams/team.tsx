import React from 'react';
import styled from 'styled-components';
import { useReplicant } from 'use-nodecg';

import { CSGOOutputAllplayer } from '../../../types/csgo-gsi';
import { Team as ITeam } from '../../../types/team-preset';

import { Grid } from '@material-ui/core';
import { PlayerBox } from './player-box';
import { PlayerDataAll } from '../../../types/extra-data';

const TeamContainer = styled.div`
	width: 324px;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const TeamTitle = styled.div`
	display: flex;
	align-items: center;
`;

const TeamName = styled.span`
	font-size: 23px;
`;

const TeamImage = styled.img`
	height: 68px;
	width: auto;
	margin-right: 15px;
`;

interface Props {
	team: ITeam | undefined;
	players: CSGOOutputAllplayer[];
}

export const Team: React.FC<Props> = (props: Props) => {
	const [playerDataRep] = useReplicant<PlayerDataAll>('playerData', {});

	const teamPlayers = props.players.map((player) => {
		return <PlayerBox extraPlayer={playerDataRep[player.steamId]} player={player} key={player.steamId} />;
	});

	return (
		<TeamContainer>
			<TeamTitle>
				{props.team && <TeamImage src={props.team.logo} />}
				<TeamName>{props.team?.name || 'No Match Scheduled'}</TeamName>
			</TeamTitle>
			<br />
			<Grid>{teamPlayers}</Grid>
		</TeamContainer>
	);
};
