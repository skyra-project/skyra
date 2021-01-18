import { Events } from '#lib/types/Enums';
import { DiscordAPIError, HTTPError } from 'discord.js';
import { Event } from 'klasa';

const NEWLINE = '\n';

export default class extends Event {
	public run(error: Error) {
		const { client } = this.context;
		if (error instanceof DiscordAPIError) {
			client.console.warn(`[API ERROR] [CODE: ${error.code}] ${error.message}${NEWLINE}            [PATH: ${error.method} ${error.path}]`);
			client.console.wtf(error.stack);
		} else if (error instanceof HTTPError) {
			client.console.warn(`[HTTP ERROR] [CODE: ${error.code}] ${error.message}${NEWLINE}             [PATH: ${error.method} ${error.path}]`);
			client.console.wtf(error.stack);
		} else {
			client.emit(Events.Wtf, error);
		}
	}
}
