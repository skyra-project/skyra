import { inspect } from 'util';
import { CLIENT_OPTIONS, TOKENS } from '../config';
import { SkyraClient } from './lib/SkyraClient';
inspect.defaultOptions.depth = 1;

const client = new SkyraClient(CLIENT_OPTIONS);
client.login(CLIENT_OPTIONS.dev ? TOKENS.BOT.DEV : TOKENS.BOT.STABLE)
	.catch(error => { client.console.error(error); });
