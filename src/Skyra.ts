import { inspect } from 'util';
import { CLIENT_OPTIONS, TOKENS } from '../config';
inspect.defaultOptions.depth = 1;

import { BaseCluster } from 'kurasuta';

export default class extends BaseCluster {

	public launch() {
		this.client.login(CLIENT_OPTIONS.dev ? TOKENS.BOT.DEV : TOKENS.BOT.STABLE)
			.catch(error => this.client.console.error(error));
	}

}
