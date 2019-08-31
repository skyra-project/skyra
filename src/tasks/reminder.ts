import { DiscordAPIError } from 'discord.js';
import { Task, Timestamp } from 'klasa';

export default class extends Task {

	public timestamp = new Timestamp('MMMM d, hh:mm:ss');

	public async run(data: ReminderTaskData) {
		// Fetch the user to send the message to
		const user = await this.client.users.fetch(data.user)
			.catch(this._catchErrorUser);

		if (user) {
			await user.send(`⏲ Hey! You asked me on ${this.timestamp.displayUTC()} to remind you:\n*${data.content}*`)
				.catch(this._catchErrorMessage);
		}
	}

	public _catchErrorUser(error: DiscordAPIError): void {
		// 10013: Unknown user
		if (error.code === 10013) return;
		throw error;
	}

	public _catchErrorMessage(error: DiscordAPIError): void {
		// 50007: Cannot send messages to this user
		if (error.code === 50007) return;
		throw error;
	}

}

interface ReminderTaskData {
	user: string;
	content: string;
}
