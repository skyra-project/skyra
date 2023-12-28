import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationMessageListener } from '#lib/moderation';
import type { GuildMessage } from '#lib/types';
import { urlRegex } from '#utils/Links/UrlRegex';
import { Colors } from '#utils/constants';
import { deleteMessage, sendTemporaryMessage } from '#utils/functions';
import { getFullEmbedAuthor } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import type { TFunction } from '@sapphire/plugin-i18next';
import type { TextChannel } from 'discord.js';

@ApplyOptions<ModerationMessageListener.Options>({
	reasonLanguageKey: LanguageKeys.Events.Moderation.Messages.ModerationLinks,
	reasonLanguageKeyWithMaximum: LanguageKeys.Events.Moderation.Messages.ModerationLinksWithMaximum,
	keyEnabled: GuildSettings.Selfmod.Links.Enabled,
	ignoredChannelsPath: GuildSettings.Selfmod.Links.IgnoredChannels,
	ignoredRolesPath: GuildSettings.Selfmod.Links.IgnoredRoles,
	softPunishmentPath: GuildSettings.Selfmod.Links.SoftAction,
	hardPunishmentPath: {
		action: GuildSettings.Selfmod.Links.HardAction,
		actionDuration: GuildSettings.Selfmod.Links.HardActionDuration,
		adder: 'links'
	}
})
export class UserModerationMessageListener extends ModerationMessageListener {
	private readonly kRegExp = urlRegex({ requireProtocol: true, tlds: true });
	private readonly kAllowedDomains = /^(?:\w+\.)?(?:discordapp.com|discord.gg|discord.com)$/i;

	protected async preProcess(message: GuildMessage): Promise<1 | null> {
		if (message.content.length === 0) return null;

		let match: RegExpExecArray | null = null;

		const allowed = await readSettings(message.guild, GuildSettings.Selfmod.Links.Allowed);
		while ((match = this.kRegExp.exec(message.content)) !== null) {
			const { hostname } = match.groups!;
			if (this.kAllowedDomains.test(hostname)) continue;
			if (allowed.includes(hostname)) continue;
			return 1;
		}

		return null;
	}

	protected onDelete(message: GuildMessage) {
		return deleteMessage(message);
	}

	protected onAlert(message: GuildMessage, t: TFunction) {
		return sendTemporaryMessage(message, t(LanguageKeys.Events.Moderation.Messages.LinkMissing, { user: message.author.toString() }));
	}

	protected onLogMessage(message: GuildMessage, t: TFunction) {
		return new EmbedBuilder()
			.setColor(Colors.Red)
			.setAuthor(getFullEmbedAuthor(message.author, message.url))
			.setFooter({ text: `#${(message.channel as TextChannel).name} | ${t(LanguageKeys.Events.Moderation.Messages.LinkFooter)}` })
			.setTimestamp();
	}
}
