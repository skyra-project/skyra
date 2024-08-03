import { readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationMessageListener } from '#lib/moderation';
import type { GuildMessage } from '#lib/types';
import { floatPromise } from '#utils/common';
import { Colors } from '#utils/constants';
import { deleteMessage, sendTemporaryMessage } from '#utils/functions';
import { getFullEmbedAuthor } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import type { TFunction } from '@sapphire/plugin-i18next';
import { codeBlock, cutText } from '@sapphire/utilities';
import { getCode, isUpper } from '@skyra/char';
import type { TextChannel } from 'discord.js';

@ApplyOptions<ModerationMessageListener.Options>({
	reasonLanguageKey: LanguageKeys.Events.Moderation.Messages.ModerationCapitals,
	reasonLanguageKeyWithMaximum: LanguageKeys.Events.Moderation.Messages.ModerationCapitalsWithMaximum,
	keyEnabled: 'selfmodCapitalsEnabled',
	ignoredChannelsPath: 'selfmodCapitalsIgnoredChannels',
	ignoredRolesPath: 'selfmodCapitalsIgnoredRoles',
	softPunishmentPath: 'selfmodCapitalsSoftAction',
	hardPunishmentPath: {
		action: 'selfmodCapitalsHardAction',
		actionDuration: 'selfmodCapitalsHardActionDuration',
		adder: 'capitals'
	}
})
export class UserModerationMessageListener extends ModerationMessageListener {
	protected async preProcess(message: GuildMessage): Promise<1 | null> {
		if (message.content.length === 0) return null;

		const settings = await readSettings(message.guild);
		if (message.content.length < settings.selfmodCapitalsMinimum) return null;

		let length = 0;
		let count = 0;

		for (const char of message.content) {
			const charCode = getCode(char);
			if (isUpper(charCode)) count++;
			length++;
		}

		const percentage = (count / length) * 100;
		return percentage >= settings.selfmodCapitalsMaximum ? 1 : null;
	}

	protected async onDelete(message: GuildMessage, t: TFunction, value: number) {
		floatPromise(deleteMessage(message));
		if (value > 25 && (await this.container.prisma.user.fetchModerationDirectMessageEnabled(message.author.id))) {
			await message.author.send(
				t(LanguageKeys.Events.Moderation.Messages.CapsFilterDm, { message: codeBlock('md', cutText(message.content, 1900)) })
			);
		}
	}

	protected onAlert(message: GuildMessage, t: TFunction) {
		return sendTemporaryMessage(message, t(LanguageKeys.Events.Moderation.Messages.CapsFilter, { user: message.author.toString() }));
	}

	protected onLogMessage(message: GuildMessage, t: TFunction) {
		return new EmbedBuilder()
			.setDescription(message.content)
			.setColor(Colors.Red)
			.setAuthor(getFullEmbedAuthor(message.author, message.url))
			.setFooter({ text: `#${(message.channel as TextChannel).name} | ${t(LanguageKeys.Events.Moderation.Messages.CapsFilterFooter)}` })
			.setTimestamp();
	}
}
