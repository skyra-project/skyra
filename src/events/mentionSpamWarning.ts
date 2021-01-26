import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Event } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class extends Event {
	public async run(message: Message) {
		await message.alert(await message.resolveKey(LanguageKeys.Monitors.NoMentionSpamAlert));
	}
}
