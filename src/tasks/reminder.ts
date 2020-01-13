import { Task, Timestamp } from 'klasa';
import { resolveOnErrorCodes } from '@utils/util';
import { APIErrors } from '@utils/constants';

export default class extends Task {

	private readonly kTimestamp = new Timestamp('YYYY/MM/DD HH:mm:ss');

	public async run(data: ReminderTaskData) {
		// Fetch the user to send the message to
		const user = await resolveOnErrorCodes(
			this.client.users.fetch(data.user),
			APIErrors.UnknownUser
		);

		if (user) {
			await resolveOnErrorCodes(
				user.send(`⏲ Hey! You asked me on ${this.kTimestamp.displayUTC()} to remind you:\n*${data.content}*`),
				APIErrors.CannotMessageUser
			);
		}
	}

}

interface ReminderTaskData {
	user: string;
	content: string;
}
