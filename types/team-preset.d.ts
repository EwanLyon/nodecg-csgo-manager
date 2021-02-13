interface TeamMeta {
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
	teams: Record<string, TeamMeta>;
	players: Record<string, Player>;
}
