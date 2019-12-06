import { FFXIV } from './FFXIV';

export class GameIntegrationsManager {

	public FFXIV: FFXIV = new FFXIV(this);

	public async initClasses(): Promise<GameIntegrationsManager> {
		await this.FFXIV.initIntergration();
		return this;
	}

}
