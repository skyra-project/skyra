import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { DMMessage, GuildMessage } from '#lib/types';
import { Event, Events } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class extends Event<Events.MentionPrefixOnly> {
	public run(message: Message) {
		return message.guild ? this.guild(message as GuildMessage) : this.dm(message as DMMessage);
	}

	private async dm(message: DMMessage) {
		const prefix = await this.context.client.fetchPrefix(message);
		return message.sendTranslated(LanguageKeys.Misc.PrefixReminder, [{ prefix }]);
	}

	private async guild(message: GuildMessage) {
		const [prefix, disabled, t] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Prefix],
			settings[GuildSettings.DisabledChannels],
			settings.getLanguage()
		]);

		if (disabled.includes(message.channel.id) && !(await message.member.isModerator())) return;
		return message.send(t(LanguageKeys.Misc.PrefixReminder, { prefix }));
	}
}
