import { Client } from 'klasa';
import { GameContent } from './OverwatchAPIResponse';
import { ProfileRAW } from '../OverwatchProfile';

export class OverwatchAPI {

	static fetch(client: Client, battletag: string): Promise<{
		time: number;
		battletag: string;
		platform: 'pc' | 'xbl' | 'psn';
	} & GameContent>;
	static _fetch(client: Client, battletag: string, profile: ProfileRAW): Promise<{
		time: number;
		battletag: string;
		platform: 'pc' | 'xbl' | 'psn';
	} & GameContent>;
	static fetchProfiles(battletag: string): Promise<ProfileRAW[]>;
	static save(client: Client, data: GameContent): Promise<void>;
	static get(client: Client, url: string): Promise<GameContent>;
	static parseBattleTag(battletag: string): string;

}
