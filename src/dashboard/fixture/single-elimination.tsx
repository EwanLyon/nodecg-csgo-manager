import { MenuItem } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';
import { useReplicant } from 'use-nodecg';
import _ from 'lodash';

import { Matches } from '../../types/matches';
import { SingleElimination as ISingleElimination } from '../../types/tournament';

import { FixtureMatch } from './fixture-match';

const SingleEliminationContainer = styled.div``;

interface Props {
	data: ISingleElimination;
	tournamentId: string;
}

const AllMatches = styled.div`
	display: flex;
	height: 100%;
	justify-content: center;
	align-items: center;
	gap: 64px;
`;

const RoundAndBracket = styled.div`
	display: flex;
`;

const Rounds = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	gap: 16px;

	&:nth-child(3n) {
		gap: 80px;
	}
`;

const BranchHolder = styled.div`
	display: flex;
	flex-direction: column;
	margin-right: -64px;
	justify-content: space-around;
`;

export const SingleElimination: React.FC<Props> = (props: Props) => {
	const [matchesRep] = useReplicant<Matches>('matches', []);

	const allMatches = matchesRep.map((match) => {
		return (
			<MenuItem key={match.id} value={match.id}>
				{match.teamA.name} vs {match.teamB.name} @ {match.time}
			</MenuItem>
		);
	});

	const eliminationHeight = 70 * props.data.matches[0].length;

	const allElimMatches = (
		<AllMatches style={{ height: eliminationHeight }}>
			{props.data.matches.map((round, i) => {
				return (
					<RoundAndBracket key={i} style={{ height: eliminationHeight }}>
						<Rounds style={{ height: eliminationHeight }}>
							{round.map((matchId, k) => {
								return (
									<FixtureMatch
										key={k}
										match={matchesRep.find((match) => match.id === matchId)}
										allMatchesMenuItems={allMatches}
										changeMatch={changeMatch}
										round={i}
										matchNo={k}
									/>
								);
							})}
						</Rounds>
						<BranchHolder key={i + 'b'} style={{ height: eliminationHeight }}>
							{_.times(round.length / 2, (j) => {
								return (
									<EliminationConnector
										key={j}
										noOfPrevRounds={round.length}
										elimHeight={eliminationHeight}
									/>
								);
							})}
						</BranchHolder>
					</RoundAndBracket>
				);
			})}
		</AllMatches>
	);

	function changeMatch(id: string, round: number, match: number) {
		nodecg.sendMessage('setSingleElimMatch', { tournamentId: props.tournamentId, matchId: id, round, match });
	}

	return <SingleEliminationContainer>{allElimMatches}</SingleEliminationContainer>;
};

const Branch = styled.div`
	height: 2px;
	background: white;
	width: 50px;
`;

const Trunk = styled.div`
	width: 2px;
	background: white;
`;

interface ElimConnectorProps {
	noOfPrevRounds: number;
	elimHeight: number;
}

const EliminationConnector: React.FC<ElimConnectorProps> = (props: ElimConnectorProps) => {
	return (
		<div
			style={{
				display: 'flex',
				height: props.elimHeight / 2 / Math.log2(props.noOfPrevRounds),
			}}>
			<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
				<Branch />
				<Branch />
			</div>
			<Trunk style={{ height: '100%' }} />
			<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 144 }}>
				<Branch />
			</div>
		</div>
	);
};
