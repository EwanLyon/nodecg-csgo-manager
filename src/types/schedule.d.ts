import { Team } from './team-preset';

export type Schedule = ScheduleItem[];

export interface ScheduleItem {
	teamA: Team;
	teamB: Team;
	time: string;
	/**
	 * Best of 1, 3, 5, etc...
	 */
	matchType: string;
	id: string;
}
