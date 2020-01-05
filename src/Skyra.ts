import 'module-alias/register';
import { SkyraClient } from '@lib/SkyraClient';
import { CLIENT_OPTIONS, TOKENS } from '@root/config';
import { inspect } from 'util';
inspect.defaultOptions.depth = 1;

const client = new SkyraClient(CLIENT_OPTIONS);
client.login(TOKENS.BOT_TOKEN)
	.catch(error => { client.console.error(error); });
