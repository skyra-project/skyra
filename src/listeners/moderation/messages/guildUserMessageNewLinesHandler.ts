import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationMessageListener } from '#lib/moderation';
import type { GuildMessage } from '#lib/types';
import { Colors } from '#utils/constants';
import { deleteMessage, sendTemporaryMessage } from '#utils/functions';
import { getContent, getFullEmbedAuthor } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import type { TFunction } from '@sapphire/plugin-i18next';
import type { TextChannel } from 'discord.js';

const NEW_LINE = '\n';

@ApplyOptions<ModerationMessageListener.Options>({
	reasonLanguageKey: LanguageKeys.Events.Moderation.Messages.ModerationNewLine,
	reasonLanguageKeyWithMaximum: LanguageKeys.Events.Moderation.Messages.ModerationNewLineWithMaximum,
	keyEnabled: GuildSettings.Selfmod.NewLines.Enabled,
	ignoredChannelsPath: GuildSettings.Selfmod.NewLines.IgnoredChannels,
	ignoredRolesPath: GuildSettings.Selfmod.NewLines.IgnoredRoles,
	softPunishmentPath: GuildSettings.Selfmod.NewLines.SoftAction,
	hardPunishmentPath: {
		action: GuildSettings.Selfmod.NewLines.HardAction,
		actionDuration: GuildSettings.Selfmod.NewLines.HardActionDuration,
		adder: 'newlines'
	}
})
export class UserModerationMessageListener extends ModerationMessageListener {
	protected async preProcess(message: GuildMessage): Promise<1 | null> {
		const threshold = await readSettings(message.guild, GuildSettings.Selfmod.NewLines.Maximum);
		if (threshold === 0) return null;

		const content = getContent(message);
		if (content === null) return null;

		let count = 0;
		for (let index = -2; index !== -1; index = content.indexOf(NEW_LINE, index + 1)) count++;

		return count > threshold ? 1 : null;
	}

	protected onDelete(message: GuildMessage) {
		return deleteMessage(message);
	}

	protected onAlert(message: GuildMessage, t: TFunction) {
		return sendTemporaryMessage(message, t(LanguageKeys.Events.Moderation.Messages.NewLineFilter, { user: message.author.toString() }));
	}

	protected onLogMessage(message: GuildMessage, t: TFunction) {
		return new EmbedBuilder()
			.setDescription(message.content)
			.setColor(Colors.Red)
			.setAuthor(getFullEmbedAuthor(message.author, message.url))
			.setFooter({ text: `#${(message.channel as TextChannel).name} | ${t(LanguageKeys.Events.Moderation.Messages.NewLineFooter)}` })
			.setTimestamp();
	}
}
