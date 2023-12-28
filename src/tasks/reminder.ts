import { ResponseType, Task, type PartialResponseValue } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getT } from '#lib/i18n/translate';
import { resolveOnErrorCodes } from '#utils/common';
import { TimestampStyles, time } from '@discordjs/builders';
import { RESTJSONErrorCodes } from 'discord.js';

export class UserTask extends Task {
	public async run(data: ReminderTaskData): Promise<PartialResponseValue | null> {
		// Fetch the user to send the message to
		const user = await resolveOnErrorCodes(this.container.client.users.fetch(data.user), RESTJSONErrorCodes.UnknownUser);

		if (user) {
			const timestamp = time(new Date(), TimestampStyles.ShortDateTime);
			const reminderHeader = getT()(LanguageKeys.System.ReminderHeader, { timestamp });

			await resolveOnErrorCodes(
				//
				user.send(`${reminderHeader}\n*${data.content}*`),
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
