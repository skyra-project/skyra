import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { DMMessage, GuildMessage } from '#lib/types';
import { isModerator, sendLocalizedMessage } from '#utils/functions';
import { Events, Listener } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

export default class extends Listener<typeof Events.MentionPrefixOnly> {
	public run(message: Message) {
		return message.guild ? this.guild(message as GuildMessage) : this.dm(message as DMMessage);
	}

	private async dm(message: DMMessage) {
		const prefix = (await this.container.client.fetchPrefix(message)) as string;
		return sendLocalizedMessage(message, { key: LanguageKeys.Misc.PrefixReminder, formatOptions: { prefix } });
	}

	private async guild(message: GuildMessage) {
		const [prefix, disabled, t] = await readSettings(message.guild, (settings) => [
			settings[GuildSettings.Prefix],
			settings[GuildSettings.DisabledChannels],
			settings.getLanguage()
		]);

		if (disabled.includes(message.channel.id) && !(await isModerator(message.member))) return;
		return send(message, t(LanguageKeys.Misc.PrefixReminder, { prefix }));
	}
}
