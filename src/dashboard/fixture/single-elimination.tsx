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

const Round = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;

	&:nth-child(3n) {
		gap: 80px;
	}
`;

const BranchHolder = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	gap: 64px;
	margin: 0 -64px;

	&:nth-child(odd) {
		gap: 124px;
	}
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

	const allElimMatches = (
		<AllMatches>
			{props.data.matches.map((round, i) => {
				return (
					<>
						<Round key={i}>
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
						</Round>
						{i - 1 !== props.data.matches[i].length ? (
							<BranchHolder key={i + 'b'}>
								{_.times(round.length / 2, (j) => {
									return <EliminationConnector key={j} differentGap={i % 2 !== 0} />;
								})}
							</BranchHolder>
						) : (
							<></>
						)}
					</>
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
	differentGap?: boolean;
}

const EliminationConnector: React.FC<ElimConnectorProps> = (props: ElimConnectorProps) => {
	return (
		<div
			style={{
				display: 'flex',
				height: props.differentGap ? 144 : 78,
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
