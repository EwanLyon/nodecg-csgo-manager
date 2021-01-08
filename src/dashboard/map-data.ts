/* eslint-disable @typescript-eslint/camelcase */
export interface MapRadarData {
	xMin: number;
	xMax: number;
	yMin: number;
	yMax: number;
	heightCross?: number;
}

export const MapData: Record<string, MapRadarData> = {
	de_dust2: {
		xMin: -2476,
		xMax: 2029.6,
		yMin: -1266.6,
		yMax: 3239
	},
	de_inferno: {
		xMin: -2087,
		xMax: 2930.6,
		yMin: -1147.6,
		yMax: 3870
	},
	de_nuke: {
		xMin: -3453,
		xMax: 3715,
		yMin: -4281,
		yMax: 2887,
		heightCross: -495
	},
	de_mirage: {
		xMin: -3230,
		xMax: 1890,
		yMin: -3407,
		yMax: 1713
	},
	de_cache: {
		xMin: -2000,
		xMax: 3632,
		yMin: -2382,
		yMax: 3250
	},
	de_overpass: {
		xMin: -4831,
		xMax: 493.8,
		yMin: -3543.8,
		yMax: 1781
	},
	de_train: {
		xMin: -2477,
		xMax: 2335.8,
		yMin: -2420.8,
		yMax: 2392
	},
	de_vertigo: {
		xMin: -3168,
		xMax: 928,
		yMin: -2334,
		yMax: 1762,
		heightCross: 11700
	}
};
