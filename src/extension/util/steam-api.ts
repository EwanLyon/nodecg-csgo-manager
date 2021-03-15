import * as nodecgApiContext from './nodecg-api-context';
import fetch from 'node-fetch';
const nodecg = nodecgApiContext.get();

interface SteamProfileData {
	steamid: string;
	pfp: string;
	country?: string;
	realname?: string;
}

export async function getProfilePicture(steamid: string): Promise<{ id: string; pfp: string }[]> {
	if (nodecg.bundleConfig.steamApiKey) {
		const json = await fetch(
			`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${nodecg.bundleConfig.steamApiKey}&steamids=${steamid}`,
		).then((res) => res.json());
		return json.response.players.map((player: Record<string, unknown>) => {
			return { id: player.steamid, pfp: player.avatarfull };
		});
	} else {
		nodecg.log.error('No Steam API Key')
	}

	return [];
}

export async function getProfilePictures(
	steamids: string[],
): Promise<{ id: string; pfp: string }[]> {
	if (steamids.length > 100) {
		throw new Error('Cannot request over 100 steam ids');
	}

	const joinedSteamIds = steamids.join(',');
	return getProfilePicture(joinedSteamIds);
}

export async function getProfileData(steamids: string[]): Promise<SteamProfileData[]> {
	if (steamids.length > 100) {
		throw new Error('Cannot request over 100 steam ids');
	}

	const joinedSteamIds = steamids.join(',');
	if (nodecg.bundleConfig.steamApiKey) {
		const json = await fetch(
			`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${nodecg.bundleConfig.steamApiKey}&steamids=${joinedSteamIds}`,
		).then((res) => res.json());
		return json.response.players.map((player: Record<string, unknown>) => {
			return {
				steamid: player.steamid,
				pfp: player.avatarfull,
				country: player.loccountrycode,
				realname: player.realname,
			} as SteamProfileData;
		});
	} else {
		nodecg.log.error('No Steam API Key')
	}

	return [];
}
