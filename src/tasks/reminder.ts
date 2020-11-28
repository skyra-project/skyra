import { PartialResponseValue, ResponseType, Task } from '#lib/database';
import { resolveOnErrorCodes } from '#utils/util';
import { Timestamp } from '@sapphire/time-utilities';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';

export default class extends Task {
	private readonly kTimestamp = new Timestamp('YYYY/MM/DD HH:mm:ss');

	public async run(data: ReminderTaskData): Promise<PartialResponseValue | null> {
		// Fetch the user to send the message to
		const user = await resolveOnErrorCodes(this.client.users.fetch(data.user), RESTJSONErrorCodes.UnknownUser);

		if (user) {
			await resolveOnErrorCodes(
				user.send(`⏲ Hey! You asked me on ${this.kTimestamp.displayUTC(Date.now())} to remind you:\n*${data.content}*`),
				RESTJSONErrorCodes.CannotSendMessagesToThisUser
			);
		}

		return { type: ResponseType.Finished };
	}
}

interface ReminderTaskData {
	user: string;
	content: string;
}
