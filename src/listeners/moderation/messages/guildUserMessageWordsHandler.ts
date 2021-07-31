import { GuildSettings, readSettings } from '#lib/database';
import { SkyraEmbed } from '#lib/discord';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationMessageListener } from '#lib/moderation';
import { IncomingType, OutgoingType } from '#lib/moderation/workers';
import type { GuildMessage } from '#lib/types';
import { Colors } from '#lib/types/Constants';
import { floatPromise } from '#utils/common';
import { deleteMessage, sendTemporaryMessage } from '#utils/functions';
import { getContent } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { codeBlock, cutText } from '@sapphire/utilities';
import type { TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<ModerationMessageListener.Options>({
	reasonLanguageKey: LanguageKeys.Events.Moderation.Messages.ModerationWords,
	reasonLanguageKeyWithMaximum: LanguageKeys.Events.Moderation.Messages.ModerationWordsWithMaximum,
	keyEnabled: GuildSettings.Selfmod.Filter.Enabled,
	ignoredChannelsPath: GuildSettings.Selfmod.Filter.IgnoredChannels,
	ignoredRolesPath: GuildSettings.Selfmod.Filter.IgnoredRoles,
	softPunishmentPath: GuildSettings.Selfmod.Filter.SoftAction,
	hardPunishmentPath: {
		action: GuildSettings.Selfmod.Filter.HardAction,
		actionDuration: GuildSettings.Selfmod.Filter.HardActionDuration,
		adder: 'words'
	}
})
export class UserModerationMessageListener extends ModerationMessageListener {
	protected async preProcess(message: GuildMessage): Promise<FilterResults | null> {
		const content = getContent(message);
		if (content === null) return null;

		const regExp = await readSettings(message.guild, (settings) => settings.wordFilterRegExp);
		if (regExp === null) return null;

		const result = await this.container.workers.send({ type: IncomingType.RunRegExp, regExp, content }, 500);
		return result.type === OutgoingType.RegExpMatch ? result : null;
	}

	protected async onDelete(message: GuildMessage, t: TFunction, value: FilterResults) {
		floatPromise(deleteMessage(message));
		if (message.content.length > 25 && (await this.container.db.fetchModerationDirectMessageEnabled(message.author.id))) {
			await message.author.send(
				t(LanguageKeys.Events.Moderation.Messages.WordFilterDm, { filtered: codeBlock('md', cutText(value.filtered, 1900)) })
			);
		}
	}

	protected onAlert(message: GuildMessage, t: TFunction) {
		return sendTemporaryMessage(message, t(LanguageKeys.Events.Moderation.Messages.WordFilter, { user: message.author.toString() }));
	}

	protected onLogMessage(message: GuildMessage, t: TFunction, results: FilterResults) {
		return new SkyraEmbed()
			.splitFields(cutText(results.highlighted, 4000))
			.setColor(Colors.Red)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${t(LanguageKeys.Events.Moderation.Messages.WordFooter)}`)
			.setTimestamp();
	}
}

interface FilterResults {
	filtered: string;
	highlighted: string;
}
