import { Events } from '@lib/types/Enums';
import { DiscordAPIError, HTTPError } from 'discord.js';
import { Event } from 'klasa';

const NEWLINE = '\n';

export default class extends Event {
	public run(error: Error) {
		if (error instanceof DiscordAPIError) {
			this.client.console.warn(`[API ERROR] [CODE: ${error.code}] ${error.message}${NEWLINE}            [PATH: ${error.method} ${error.path}]`);
			this.client.console.wtf(error.stack);
		} else if (error instanceof HTTPError) {
			this.client.console.warn(
				`[HTTP ERROR] [CODE: ${error.code}] ${error.message}${NEWLINE}             [PATH: ${error.method} ${error.path}]`
			);
			this.client.console.wtf(error.stack);
		} else {
			this.client.emit(Events.Wtf, error);
		}
	}
}
