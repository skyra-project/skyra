import { PartialResponseValue, ResponseType } from '@lib/database/entities/ScheduleEntity';
import { resolveOnErrorCodes } from '@utils/util';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { Task, Timestamp } from 'klasa';

export default class extends Task {
	private readonly kTimestamp = new Timestamp('YYYY/MM/DD HH:mm:ss');

	public async run(data: ReminderTaskData): Promise<PartialResponseValue | null> {
		// Fetch the user to send the message to
		const user = await resolveOnErrorCodes(this.client.users.fetch(data.user), RESTJSONErrorCodes.UnknownUser);

		if (user) {
			await resolveOnErrorCodes(
				user.send(`⏲ Hey! You asked me on ${this.kTimestamp.displayUTC()} to remind you:\n*${data.content}*`),
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
