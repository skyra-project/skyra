import { NAME } from '#root/config';
import { BaseController } from './BaseController';

export abstract class BaseBotController<T> extends BaseController<T> {
	public constructor() {
		super(NAME);
	}

	protected resolveCollectedValidity(): boolean {
		return true;
	}
}
