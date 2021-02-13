interface Team {
	alias: string;
	name: string;
	logo?: string;
}

interface Player {
	realName?: string;
	steamId: string;
	profilePicture?: string;
	country?: string;
	teamName?: string;
}

export interface TeamsPreset {
	teams: Record<string, Team>;
	players: Record<string, Player>;
}
