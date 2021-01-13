import { DbSet, ModerationEntity } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { BrandingColors, Moderation } from '#utils/constants';
import { pickRandom } from '#utils/util';
import Collection from '@discordjs/collection';
import { chunk, cutText } from '@sapphire/utilities';
import { ApplyOptions, requiredPermissions } from '@skyra/decorators';
import { MessageEmbed, User } from 'discord.js';

const COLORS = [0x80f31f, 0xa5de0b, 0xc7c101, 0xe39e03, 0xf6780f, 0xfe5326, 0xfb3244];
type DurationDisplay = (time: number) => string;

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Moderation.HistoryDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.HistoryExtended,
	permissionLevel: PermissionLevels.Moderator,
	runIn: ['text'],
	usage: '<details|overview:default> [user:username]',
	usageDelim: ' ',
	subcommands: true
})
export default class extends SkyraCommand {
	public async overview(message: GuildMessage, [target = message.author]: [User]) {
		const logs = await message.guild.moderation.fetch(target.id);
		let warnings = 0;
		let mutes = 0;
		let kicks = 0;
		let bans = 0;

		for (const log of logs.values()) {
			if (log.invalidated || log.appealType) continue;
			switch (log.typeVariation) {
				case Moderation.TypeVariation.Ban:
				case Moderation.TypeVariation.SoftBan:
					++bans;
					break;
				case Moderation.TypeVariation.Mute:
					++mutes;
					break;
				case Moderation.TypeVariation.Kick:
					++kicks;
					break;
				case Moderation.TypeVariation.Warning:
					++warnings;
			}
		}

		const index = Math.min(COLORS.length - 1, warnings + mutes + kicks + bans);
		const t = await message.fetchT();

		return message.send(
			new MessageEmbed()
				.setColor(COLORS[index])
				.setAuthor(target.username, target.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setFooter(
					t(LanguageKeys.Commands.Moderation.HistoryFooterNew, {
						warnings,
						mutes,
						kicks,
						bans,
						warningsText: t(LanguageKeys.Commands.Moderation.HistoryFooterWarning, { count: warnings }),
						mutesText: t(LanguageKeys.Commands.Moderation.HistoryFooterMutes, { count: mutes }),
						kicksText: t(LanguageKeys.Commands.Moderation.HistoryFooterKicks, { count: kicks }),
						bansText: t(LanguageKeys.Commands.Moderation.HistoryFooterBans, { count: bans })
					})
				)
		);
	}

	@requiredPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	public async details(message: GuildMessage, [target = message.author]: [User]) {
		const t = await message.fetchT();
		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const entries = (await message.guild.moderation.fetch(target.id)).filter((log) => !log.invalidated && !log.appealType);
		if (!entries.size) throw t(LanguageKeys.Commands.Moderation.ModerationsEmpty);

		const display = new UserRichDisplay(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setAuthor(this.client.user!.username, this.client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setTitle(t(LanguageKeys.Commands.Moderation.ModerationsAmount, { count: entries.size }))
		);

		// Fetch usernames
		const usernames = await this.fetchAllModerators(entries);

		// Set up the formatter
		const durationDisplay = (value: number) => t(LanguageKeys.Globals.DurationValue, { value });

		for (const page of chunk([...entries.values()], 10)) {
			display.addPage((template: MessageEmbed) => {
				for (const entry of page) {
					const { name, value } = this.displayModerationLogFromModerators(usernames, durationDisplay, entry);
					template.addField(name, value);
				}

				return template;
			});
		}

		await display.start(response, message.author.id);
		return response;
	}

	private displayModerationLogFromModerators(users: Map<string, string>, duration: DurationDisplay, entry: ModerationEntity) {
		const appealOrInvalidated = entry.appealType || entry.invalidated;
		const remainingTime =
			appealOrInvalidated || entry.duration === null || entry.createdAt === null ? null : entry.createdTimestamp + entry.duration! - Date.now();
		const expiredTime = remainingTime !== null && remainingTime <= 0;
		const formattedModerator = users.get(entry.moderatorID!);
		const formattedReason = entry.reason ? cutText(entry.reason, 800) : 'None';
		const formattedDuration = remainingTime === null || expiredTime ? '' : `\nExpires in: ${duration(remainingTime)}`;
		const formatter = expiredTime || appealOrInvalidated ? '~~' : '';

		return {
			name: `\`${entry.caseID}\` | ${entry.title}`,
			value: `${formatter}Moderator: **${formattedModerator}**.\n${formattedReason}${formattedDuration}${formatter}`
		};
	}

	private async fetchAllModerators(entries: Collection<number, ModerationEntity>) {
		const moderators = new Map() as Map<string, string>;
		for (const entry of entries.values()) {
			const id = entry.moderatorID!;
			if (!moderators.has(id)) moderators.set(id, (await entry.fetchModerator()).username);
		}
		return moderators;
	}
}
