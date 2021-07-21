import { LanguageKeys } from '#lib/i18n/languageKeys';
import { sendTemporaryMessage } from '#utils/functions';
import { Event } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserEvent extends Event {
	public async run(message: Message) {
		await sendTemporaryMessage(message, await message.resolveKey(LanguageKeys.Events.NoMentionSpam.Alert));
	}
}
