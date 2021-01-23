import { DiscordAPIError, HTTPError } from 'discord.js';
import { Event } from 'klasa';

const NEWLINE = '\n';

export default class extends Event {
	public run(error: Error) {
		const { client } = this.context;
		if (error instanceof DiscordAPIError) {
			client.logger.warn(`[API ERROR] [CODE: ${error.code}] ${error.message}${NEWLINE}            [PATH: ${error.method} ${error.path}]`);
			client.logger.fatal(error.stack);
		} else if (error instanceof HTTPError) {
			client.logger.warn(`[HTTP ERROR] [CODE: ${error.code}] ${error.message}${NEWLINE}             [PATH: ${error.method} ${error.path}]`);
			client.logger.fatal(error.stack);
		} else {
			client.logger.fatal(error);
		}
	}
}
