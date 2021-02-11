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

const RoundAndBracket = styled.div`
	display: flex;
`;

const WinnerRound = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	gap: 16px;

	&:nth-child(3) {
		gap: 80px;
	}
`;

const LoserRound = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	gap: 16px;
`;

const BranchHolder = styled.div`
	display: flex;
	flex-direction: column;
	margin-right: -64px;
	justify-content: space-around;
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

	const winnerEliminationHeight = 70 * props.data.winnerMatches[0].length;
	const loserEliminationHeight = 70 * props.data.loserMatches[0].length;

	const allWinnerMatches = (
		<AllMatches style={{ height: winnerEliminationHeight }}>
			{props.data.winnerMatches.map((round, i) => {
				return (
					<RoundAndBracket style={{ height: winnerEliminationHeight }} key={i}>
						<WinnerRound key={i} style={{ height: winnerEliminationHeight }}>
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
						{round.length === 1 ? (
							// Don't display if last round
							i !== props.data.winnerMatches.length - 1 && (
								<DoubleElimBranches
									branchNo={1}
									elimHeight={winnerEliminationHeight}
								/>
							)
						) : (
							<BranchHolder key={i + 'b'} style={{ height: winnerEliminationHeight }}>
								{_.times(round.length / 2, (j) => {
									return (
										<EliminationConnector
											key={j}
											noOfPrevRounds={round.length}
											elimHeight={winnerEliminationHeight}
										/>
									);
								})}
							</BranchHolder>
						)}
					</RoundAndBracket>
				);
			})}
		</AllMatches>
	);

	const allLoserMatches = (
		<AllMatches style={{ height: loserEliminationHeight }}>
			{props.data.loserMatches.map((round, i) => {
				return (
					<RoundAndBracket style={{ height: loserEliminationHeight }} key={i}>
						<LoserRound key={i} style={{ height: loserEliminationHeight }}>
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
							<DoubleElimBranches
								branchNo={round.length}
								elimHeight={loserEliminationHeight}
							/>
						) : (
							i !== props.data.loserMatches.length - 1 && (
								<BranchHolder
									key={i + 'b'}
									style={{ height: loserEliminationHeight }}>
									{_.times(round.length / 2, (j) => {
										return (
											<EliminationConnector
												key={j}
												elimHeight={loserEliminationHeight}
												noOfPrevRounds={round.length}
											/>
										);
									})}
								</BranchHolder>
							)
						)}
					</RoundAndBracket>
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
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
				}}>
				<Branch />
				<Branch />
			</div>
			<Trunk style={{ height: '100%' }} />
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					gap: 144,
				}}>
				<Branch />
			</div>
		</div>
	);
};

interface Branches {
	branchNo: number;
	elimHeight: number;
}

const DoubleElimBranches: React.FC<Branches> = (props: Branches) => {
	return (
		<div
			style={{
				height: props.elimHeight,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-around',
				marginRight: -64,
			}}>
			{_.times(props.branchNo, (i) => {
				return <Branch key={i} style={{ width: props.branchNo === 1 ? 50 : 100 }} />;
			})}
		</div>
	);
};
