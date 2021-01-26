import { DbSet, GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationMessageEvent } from '#lib/moderation';
import type { GuildMessage } from '#lib/types';
import { Colors } from '#lib/types/Constants';
import { floatPromise } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { codeBlock, cutText } from '@sapphire/utilities';
import { getCode, isUpper } from '@skyra/char';
import { MessageEmbed, TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<ModerationMessageEvent.Options>({
	reasonLanguageKey: LanguageKeys.Events.Moderation.Messages.ModerationCapitals,
	reasonLanguageKeyWithMaximum: LanguageKeys.Events.Moderation.Messages.ModerationCapitalsWithMaximum,
	keyEnabled: GuildSettings.Selfmod.Capitals.Enabled,
	ignoredChannelsPath: GuildSettings.Selfmod.Capitals.IgnoredChannels,
	ignoredRolesPath: GuildSettings.Selfmod.Capitals.IgnoredRoles,
	softPunishmentPath: GuildSettings.Selfmod.Capitals.SoftAction,
	hardPunishmentPath: {
		action: GuildSettings.Selfmod.Capitals.HardAction,
		actionDuration: GuildSettings.Selfmod.Capitals.HardActionDuration,
		adder: 'capitals'
	}
})
export class UserModerationMessageEvent extends ModerationMessageEvent {
	protected async preProcess(message: GuildMessage) {
		if (message.content.length === 0) return null;

		const [minimumCapitals, maximumCapitals] = await message.guild.readSettings([
			GuildSettings.Selfmod.Capitals.Minimum,
			GuildSettings.Selfmod.Capitals.Maximum
		]);

		if (message.content.length < minimumCapitals) return null;

		let length = 0;
		let count = 0;

		for (const char of message.content) {
			const charCode = getCode(char);
			if (isUpper(charCode)) count++;
			length++;
		}

		const percentage = (count / length) * 100;
		return percentage >= maximumCapitals ? 1 : null;
	}

	protected async onDelete(message: GuildMessage, t: TFunction, value: number) {
		floatPromise(message.nuke());
		if (value > 25 && (await DbSet.fetchModerationDirectMessageEnabled(message.author.id))) {
			await message.author.send(
				t(LanguageKeys.Events.Moderation.Messages.CapsFilterDm, { message: codeBlock('md', cutText(message.content, 1900)) })
			);
		}
	}

	protected onAlert(message: GuildMessage, t: TFunction) {
		return message.alert(t(LanguageKeys.Events.Moderation.Messages.CapsFilter, { user: message.author.toString() }));
	}

	protected onLogMessage(message: GuildMessage, t: TFunction) {
		return new MessageEmbed()
			.setDescription(message.content)
			.setColor(Colors.Red)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${t(LanguageKeys.Events.Moderation.Messages.CapsFilterFooter)}`)
			.setTimestamp();
	}
}
