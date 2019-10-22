import { DiscordAPIError } from 'discord.js';
import { Task, Timestamp } from 'klasa';

export default class extends Task {

	public timestamp = new Timestamp('MMMM d, hh:mm:ss');

	public async run(data: ReminderTaskData) {
		// Fetch the user to send the message to
		const user = await this.client.users.fetch(data.user)
			.catch(error => this._catchError(error));

		if (user) {
			await user.send(`⏲ Hey! You asked me on ${this.timestamp.displayUTC()} to remind you:\n*${data.content}*`)
				.catch(error => this._catchError(error));
		}
	}

	private _catchError(error: DiscordAPIError): void {
		// 50007: Cannot send messages to this user
		// 10013: Unknown user
		if ([50007, 10013].includes(error.code)) return;
		throw error;
	}

}

interface ReminderTaskData {
	user: string;
	content: string;
}
