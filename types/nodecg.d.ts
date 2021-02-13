export * from 'nodecg/types/server';
export { ListenForCb } from 'nodecg/types/lib/nodecg-instance';
export * from 'nodecg/types/browser';

export interface Asset {
	base: string;
	bundleName: string;
	category: string;
	ext: string;
	name: string;
	sum: string;
	url: string;
}
