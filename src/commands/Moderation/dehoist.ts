import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { getColor, sendLoadingMessage } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { TFunction } from '@sapphire/plugin-i18next';
import { codeBlock } from '@sapphire/utilities';
import { PermissionFlagsBits, type GuildMember } from 'discord.js';

const [kLowestNumberCode, kHighestNumberCode] = ['0'.charCodeAt(0), '9'.charCodeAt(0)];

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['dh'],
	description: LanguageKeys.Commands.Moderation.DehoistDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.DehoistExtended,
	permissionLevel: PermissionLevels.Moderator,
	requiredClientPermissions: [PermissionFlagsBits.ManageNicknames, PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraCommand {
	private kLowestCode = 'A'.charCodeAt(0);

	public override async messageRun(message: GuildMessage, args: SkyraCommand.Args) {
		if (message.guild.members.cache.size !== message.guild.memberCount) {
			await sendLoadingMessage(message, args.t);
			await message.guild.members.fetch();
		}

		let counter = 0;
		const errored: ErroredChange[] = [];
		const hoistedMembers: GuildMember[] = [];
		for (const member of message.guild.members.cache.values()) {
			if (member.manageable && this.shouldDeHoist(member)) hoistedMembers.push(member);
		}

		if (hoistedMembers.length > 0) {
			await send(message, args.t(LanguageKeys.Commands.Moderation.DehoistStarting, { count: hoistedMembers.length }));
		}

		for (let i = 0; i < hoistedMembers.length; i++) {
			const member = hoistedMembers[i];
			const { displayName } = member;

			const char = displayName.codePointAt(0)!;

			// Replace the first character of the offending user's with an UTF-16 character, bringing'em down, down, down.
			// The ternary cuts 2 characters if the 1st codepoint belongs in UTF-16
			const newNick = `🠷${displayName.slice(char <= 0xff ? 1 : 2)}`;
			try {
				await member.setNickname(newNick, 'Dehoisting');
			} catch {
				errored.push({ oldNick: displayName, newNick });
			}

			++counter;

			// update the counter every 10 dehoists
			if ((i + 1) % 10 === 0) {
				const deHoistPercentage = (i / hoistedMembers.length) * 100;
				const content = args.t(LanguageKeys.Commands.Moderation.DehoistProgress, { count: i + 1, percentage: Math.round(deHoistPercentage) });
				await send(message, content);
			}
		}

		// We're done!
		const embed = this.prepareFinalEmbed(message, args.t, counter, errored);
		return send(message, { embeds: [embed] });
	}

	private shouldDeHoist(member: GuildMember) {
		const { displayName } = member;
		if (!displayName) return false;

		const char = displayName.codePointAt(0)!;

		// If it's lower than '0' or is higher than '9' and lower than 'A', then it's hoisting
		return char < this.kLowestCode && (char < kLowestNumberCode || char > kHighestNumberCode);
	}

	private prepareFinalEmbed(message: GuildMessage, t: TFunction, deHoistedMembers: number, erroredChanges: ErroredChange[]) {
		const embedLanguage = t(LanguageKeys.Commands.Moderation.DehoistEmbed, {
			dehoistedMemberCount: deHoistedMembers,
			dehoistedWithErrorsCount: deHoistedMembers - erroredChanges.length,
			errored: erroredChanges.length,
			users: message.guild.members.cache.size
		});
		const embed = new EmbedBuilder().setColor(getColor(message)).setTitle(embedLanguage.title);

		let { description } = embedLanguage;
		if (deHoistedMembers <= 0) description = embedLanguage.descriptionNoone;
		if (deHoistedMembers > 1) description = embedLanguage.descriptionMultipleMembers;
		if (erroredChanges.length > 0) {
			description = erroredChanges.length > 1 ? embedLanguage.descriptionWithMultipleErrors : embedLanguage.descriptionWithError;
			const erroredNicknames = erroredChanges.map((entry) => `${entry.oldNick} => ${entry.newNick}`).join('\n');
			const codeblock = codeBlock('js', erroredNicknames);
			embed.addFields({ name: embedLanguage.fieldErrorTitle, value: codeblock });
		}

		return embed.setDescription(description);
	}
}

interface ErroredChange {
	oldNick: string;
	newNick: string;
}
