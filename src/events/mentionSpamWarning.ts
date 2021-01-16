import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { Message } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {
	public async run(message: Message) {
		await message.alert(await message.resolveKey(LanguageKeys.Monitors.NoMentionSpamAlert));
	}
}
