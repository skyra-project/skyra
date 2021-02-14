import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Event, Events } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class extends Event<Events.MentionPrefixOnly> {
	public async run(message: Message) {
		const prefix = await this.context.client.fetchPrefix(message);
		return message.sendTranslated(LanguageKeys.Misc.PrefixReminder, [{ prefix }]);
	}
}
