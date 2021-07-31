import { LanguageKeys } from '#lib/i18n/languageKeys';
import { sendTemporaryMessage } from '#utils/functions';
import { Listener } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import type { Message } from 'discord.js';

export class UserListener extends Listener {
	public async run(message: Message) {
		await sendTemporaryMessage(message, await resolveKey(message, LanguageKeys.Events.NoMentionSpam.Alert));
	}
}
