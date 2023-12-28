import { BaseController } from '#lib/games/base/BaseController';

export abstract class BaseBotController<T> extends BaseController<T> {
	public constructor() {
		super(process.env.CLIENT_NAME);
	}

	protected resolveCollectedValidity(): boolean {
		return true;
	}
}
