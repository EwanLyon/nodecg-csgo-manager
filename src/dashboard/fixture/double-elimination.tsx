import { MenuItem } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';
import { useReplicant } from 'use-nodecg';
import _ from 'lodash';

import { Matches } from '../../types/matches';
import { DoubleElimination as IDoubleElimination } from '../../types/tournament';

import { FixtureMatch } from './fixture-match';

const DoubleEliminationContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

interface Props {
	data: IDoubleElimination;
	tournamentId: string;
}

const AllMatches = styled.div`
	display: flex;
	height: 100%;
	justify-content: center;
	align-items: center;
	gap: 64px;
`;

const WinnerRound = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;

	&:nth-child(3) {
		gap: 80px;
	}
`;

const LoserRound = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const BranchHolder = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	gap: 64px;
	margin: 0 -64px;
`;

const BracketLabel = styled.span`
	margin: 8px 0;
`;

export const DoubleElimination: React.FC<Props> = (props: Props) => {
	const [matchesRep] = useReplicant<Matches>('matches', []);

	const allMatches = matchesRep.map((match) => {
		return (
			<MenuItem key={match.id} value={match.id}>
				{match.teamA.name} vs {match.teamB.name} @ {match.time}
			</MenuItem>
		);
	});

	const allWinnerMatches = (
		<AllMatches>
			{props.data.winnerMatches.map((round, i) => {
				return (
					<>
						<WinnerRound key={i}>
							{round.map((matchId, k) => {
								return (
									<FixtureMatch
										key={k}
										match={matchesRep.find((match) => match.id === matchId)}
										allMatchesMenuItems={allMatches}
										changeMatch={changeWinnerMatch}
										round={i}
										matchNo={k}
									/>
								);
							})}
						</WinnerRound>
						{i - 1 !== props.data.winnerMatches[i].length ? (
							<BranchHolder key={i + 'b'}>
								{_.times(round.length / 2, (j) => {
									return <EliminationConnector key={j} differentGap={i % 2 !== 0} />;
								})}
							</BranchHolder>
						) : round.length === 1 ? (
							<DoubleElimBranches branchNo={1} />
						) : (
							<></>
						)}
					</>
				);
			})}
		</AllMatches>
	);

	const allLoserMatches = (
		<AllMatches>
			{props.data.loserMatches.map((round, i) => {
				return (
					<>
						<LoserRound key={i}>
							{round.map((matchId, k) => {
								return (
									<FixtureMatch
										key={k}
										match={matchesRep.find((match) => match.id === matchId)}
										allMatchesMenuItems={allMatches}
										changeMatch={changeLoserMatch}
										round={i}
										matchNo={k}
									/>
								);
							})}
						</LoserRound>
						{round.length === props.data.loserMatches[i + 1]?.length ? (
							<DoubleElimBranches branchNo={round.length} />
						) : i - 1 !== props.data.loserMatches[i].length ? (
							<BranchHolder key={i + 'b'}>
								{_.times(round.length / 2, (j) => {
									return <EliminationConnector key={j} />;
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

	function changeWinnerMatch(id: string, round: number, match: number) {
		nodecg.sendMessage('setDoubleElimMatch', {
			tournamentId: props.tournamentId,
			matchId: id,
			round,
			match,
			loserBracket: false,
		});
	}

	function changeLoserMatch(id: string, round: number, match: number) {
		nodecg.sendMessage('setDoubleElimMatch', {
			tournamentId: props.tournamentId,
			matchId: id,
			round,
			match,
			loserBracket: true,
		});
	}

	return (
		<DoubleEliminationContainer>
			<BracketLabel>Winner Bracket</BracketLabel>
			{allWinnerMatches}
			<BracketLabel>Loser Bracket</BracketLabel>
			{allLoserMatches}
		</DoubleEliminationContainer>
	);
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

interface Branches {
	branchNo: number;
}

const DoubleElimBranches: React.FC<Branches> = (props: Branches) => {
	return (
		<div
			style={{
				height: 39 * props.branchNo,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: props.branchNo === 1 ? 'center' : 'space-between',
				margin: '0 -64px',
			}}>
			{_.times(props.branchNo, (i) => {
				return <Branch key={i} style={{ width: props.branchNo === 1 ? 50 : 100 }} />;
			})}
		</div>
	);
};
