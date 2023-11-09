import { DiscordAPIError, HTTPError } from '@discordjs/rest';
import { Listener } from '@sapphire/framework';

const NEWLINE = '\n';

export class UserListener extends Listener {
	public run(error: Error) {
		const { logger } = this.container;
		if (error instanceof DiscordAPIError) {
			logger.warn(`[API ERROR] [CODE: ${error.code}] ${error.message}${NEWLINE}            [PATH: ${error.method} ${error.url}]`);
			logger.fatal(error.stack);
		} else if (error instanceof HTTPError) {
			logger.warn(`[HTTP ERROR] [CODE: ${error.status}] ${error.message}${NEWLINE}             [PATH: ${error.method} ${error.url}]`);
			logger.fatal(error.stack);
		} else {
			logger.error(error);
		}
	}
}
