import type { ModerationEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraPaginatedMessage, SkyraSubcommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { seconds } from '#utils/common';
import { getModeration } from '#utils/functions';
import { TypeVariation } from '#utils/moderationConstants';
import { getColor, getFullEmbedAuthor, sendLoadingMessage } from '#utils/util';
import { TimestampStyles, time } from '@discordjs/builders';
import { ApplyOptions, RequiresClientPermissions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { chunk, cutText } from '@sapphire/utilities';
import { EmbedBuilder, PermissionFlagsBits, type Collection } from 'discord.js';

const COLORS = [0x80f31f, 0xa5de0b, 0xc7c101, 0xe39e03, 0xf6780f, 0xfe5326, 0xfb3244];

@ApplyOptions<SkyraSubcommand.Options>({
	aliases: ['hd', 'ho'],
	description: LanguageKeys.Commands.Moderation.HistoryDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.HistoryExtended,
	permissionLevel: PermissionLevels.Moderator,
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	subcommands: [
		{ name: 'details', messageRun: 'details' },
		{ name: 'overview', messageRun: 'overview', default: true }
	]
})
export class UserCommand extends SkyraSubcommand {
	public override messageRun(message: GuildMessage, args: SkyraSubcommand.Args, context: SkyraSubcommand.RunContext) {
		if (context.commandName === 'hd') return this.details(message, args);
		if (context.commandName === 'ho') return this.overview(message, args);
		return super.messageRun(message, args, context);
	}

	public async overview(message: GuildMessage, args: SkyraSubcommand.Args) {
		const target = args.finished ? message.author : await args.pick('userName');
		const logs = await getModeration(message.guild).fetch(target.id);
		let warnings = 0;
		let mutes = 0;
		let kicks = 0;
		let bans = 0;

		for (const log of logs.values()) {
			if (log.invalidated || log.appealType) continue;
			switch (log.type) {
				case TypeVariation.Ban:
				case TypeVariation.SoftBan:
					++bans;
					break;
				case TypeVariation.Mute:
					++mutes;
					break;
				case TypeVariation.Kick:
					++kicks;
					break;
				case TypeVariation.Warning:
					++warnings;
					break;
				default:
					break;
			}
		}

		const index = Math.min(COLORS.length - 1, warnings + mutes + kicks + bans);
		const footer = args.t(LanguageKeys.Commands.Moderation.HistoryFooterNew, {
			warnings,
			mutes,
			kicks,
			bans,
			warningsText: args.t(LanguageKeys.Commands.Moderation.HistoryFooterWarning, { count: warnings }),
			mutesText: args.t(LanguageKeys.Commands.Moderation.HistoryFooterMutes, { count: mutes }),
			kicksText: args.t(LanguageKeys.Commands.Moderation.HistoryFooterKicks, { count: kicks }),
			bansText: args.t(LanguageKeys.Commands.Moderation.HistoryFooterBans, { count: bans })
		});

		const embed = new EmbedBuilder() //
			.setColor(COLORS[index])
			.setAuthor(getFullEmbedAuthor(target))
			.setFooter({ text: footer });
		await send(message, { embeds: [embed] });
	}

	@RequiresClientPermissions(PermissionFlagsBits.EmbedLinks)
	public async details(message: GuildMessage, args: SkyraSubcommand.Args) {
		const target = args.finished ? message.author : await args.pick('userName');
		const response = await sendLoadingMessage(message, args.t);

		const entries = (await getModeration(message.guild).fetch(target.id)).filter((log) => !log.invalidated && !log.appealType);
		if (!entries.size) this.error(LanguageKeys.Commands.Moderation.ModerationsEmpty);

		const display = new SkyraPaginatedMessage({
			template: new EmbedBuilder()
				.setColor(getColor(message))
				.setTitle(args.t(LanguageKeys.Commands.Moderation.ModerationsAmount, { count: entries.size }))
		});

		// Fetch usernames
		const usernames = await this.fetchAllModerators(entries);

		// Lock in the current time
		const now = Date.now();

		for (const page of chunk([...entries.values()], 10)) {
			display.addPageEmbed((embed) => {
				for (const entry of page) {
					embed.addFields(this.displayModerationLogFromModerators(usernames, now, entry));
				}

				return embed;
			});
		}

		await display.run(response, message.author);
	}

	private displayModerationLogFromModerators(users: Map<string, string>, now: number, entry: ModerationEntity) {
		const appealOrInvalidated = entry.appealType || entry.invalidated;
		const remainingTime =
			appealOrInvalidated || entry.duration === null || entry.createdAt === null ? null : entry.createdTimestamp + entry.duration! - Date.now();
		const expiredTime = remainingTime !== null && remainingTime <= 0;
		const formattedModerator = users.get(entry.moderatorId!);
		const formattedReason = entry.reason ? cutText(entry.reason, 800) : 'None';
		const formattedDuration =
			remainingTime === null || expiredTime
				? ''
				: `\nExpires: ${time(seconds.fromMilliseconds(now + remainingTime), TimestampStyles.RelativeTime)}`;
		const formatter = expiredTime || appealOrInvalidated ? '~~' : '';

		return {
			name: `\`${entry.caseId}\` | ${entry.title}`,
			value: `${formatter}Moderator: **${formattedModerator}**.\n${formattedReason}${formattedDuration}${formatter}`
		};
	}

	private async fetchAllModerators(entries: Collection<number, ModerationEntity>) {
		const moderators = new Map() as Map<string, string>;
		for (const entry of entries.values()) {
			const id = entry.moderatorId!;
			if (!moderators.has(id)) moderators.set(id, (await entry.fetchModerator()).username);
		}
		return moderators;
	}
}
