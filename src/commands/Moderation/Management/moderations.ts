import type { ModerationEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraPaginatedMessage, SkyraSubcommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { seconds } from '#utils/common';
import { getModeration } from '#utils/functions';
import { TypeVariation } from '#utils/moderationConstants';
import { getColor, sendLoadingMessage } from '#utils/util';
import { TimestampStyles, time } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { chunk, cutText } from '@sapphire/utilities';
import { EmbedBuilder, type Collection, type User } from 'discord.js';

const enum Type {
	Mute,
	Warning,
	All
}

@ApplyOptions<SkyraSubcommand.Options>(
	SkyraSubcommand.PaginatedOptions({
		aliases: ['moderation'],
		description: LanguageKeys.Commands.Moderation.ModerationsDescription,
		detailedDescription: LanguageKeys.Commands.Moderation.ModerationsExtended,
		permissionLevel: PermissionLevels.Moderator,
		runIn: [CommandOptionsRunTypeEnum.GuildAny],
		subcommands: [
			{ name: 'mute', messageRun: 'mutes' },
			{ name: 'mutes', messageRun: 'mutes' },
			{ name: 'warning', messageRun: 'warnings' },
			{ name: 'warnings', messageRun: 'warnings' },
			{ name: 'warn', messageRun: 'warnings' },
			{ name: 'warns', messageRun: 'warnings' },
			{ name: 'all', messageRun: 'all', default: true }
		]
	})
)
export class UserPaginatedMessageCommand extends SkyraSubcommand {
	public mutes(message: GuildMessage, args: SkyraSubcommand.Args, { commandPrefix }: SkyraSubcommand.RunContext) {
		return this.handle(message, args, Type.Mute, commandPrefix);
	}

	public warnings(message: GuildMessage, args: SkyraCommand.Args, { commandPrefix }: SkyraCommand.RunContext) {
		return this.handle(message, args, Type.Warning, commandPrefix);
	}

	public all(message: GuildMessage, args: SkyraCommand.Args, { commandPrefix }: SkyraCommand.RunContext) {
		return this.handle(message, args, Type.All, commandPrefix);
	}

	private async handle(message: GuildMessage, args: SkyraCommand.Args, action: Type, prefix: string) {
		const target = args.finished ? null : await args.pick('userName');

		const response = await sendLoadingMessage(message, args.t);
		const moderation = getModeration(message.guild);
		const entries = (await (target ? moderation.fetch(target.id) : moderation.fetch())).filter(this.getFilter(action, target));

		if (!entries.size) this.error(LanguageKeys.Commands.Moderation.ModerationsEmpty, { prefix });

		const display = new SkyraPaginatedMessage({
			template: new EmbedBuilder()
				.setColor(getColor(message))
				.setTitle(args.t(LanguageKeys.Commands.Moderation.ModerationsAmount, { count: entries.size }))
		});

		// Fetch usernames
		const usernames = await (target ? this.fetchAllModerators(entries) : this.fetchAllUsers(entries));

		// Lock in the current time
		const now = Date.now();

		const displayName = action === Type.All;
		const format = target
			? this.displayModerationLogFromModerators.bind(this, usernames, now, displayName)
			: this.displayModerationLogFromUsers.bind(this, usernames, now, displayName);

		for (const page of chunk([...entries.values()], 10)) {
			display.addPageEmbed((embed) => {
				for (const entry of page) {
					embed.addFields(format(entry));
				}

				return embed;
			});
		}

		await display.run(response, message.author);
		return response;
	}

	private displayModerationLogFromModerators(users: Map<string, string>, now: number, displayName: boolean, entry: ModerationEntity) {
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
		const formatter = appealOrInvalidated || expiredTime ? '~~' : '';

		return {
			name: `\`${entry.caseId}\`${displayName ? ` | ${entry.title}` : ''}`,
			value: `${formatter}Moderator: **${formattedModerator}**.\n${formattedReason}${formattedDuration}${formatter}`
		};
	}

	private displayModerationLogFromUsers(users: Map<string, string>, now: number, displayName: boolean, entry: ModerationEntity) {
		const appealOrInvalidated = entry.appealType || entry.invalidated;
		const remainingTime =
			appealOrInvalidated || entry.duration === null || entry.createdAt === null ? null : entry.createdTimestamp + entry.duration! - Date.now();
		const expiredTime = remainingTime !== null && remainingTime <= 0;
		const formattedUser = users.get(entry.userId!);
		const formattedReason = entry.reason ? cutText(entry.reason, 800) : 'None';
		const formattedDuration =
			remainingTime === null || expiredTime
				? ''
				: `\nExpires: ${time(seconds.fromMilliseconds(now + remainingTime), TimestampStyles.RelativeTime)}`;
		const formatter = appealOrInvalidated || expiredTime ? '~~' : '';

		return {
			name: `\`${entry.caseId}\`${displayName ? ` | ${entry.title}` : ''}`,
			value: `${formatter}Moderator: **${formattedUser}**.\n${formattedReason}${formattedDuration}${formatter}`
		};
	}

	private async fetchAllUsers(entries: Collection<number, ModerationEntity>) {
		const users = new Map() as Map<string, string>;
		for (const entry of entries.values()) {
			const id = entry.userId!;
			if (!users.has(id)) users.set(id, (await entry.fetchUser()).username);
		}
		return users;
	}

	private async fetchAllModerators(entries: Collection<number, ModerationEntity>) {
		const moderators = new Map() as Map<string, string>;
		for (const entry of entries.values()) {
			const id = entry.moderatorId!;
			if (!moderators.has(id)) moderators.set(id, (await entry.fetchModerator()).username);
		}
		return moderators;
	}

	private getFilter(type: Type, target: User | null) {
		switch (type) {
			case Type.Mute:
				return target
					? (entry: ModerationEntity) =>
							entry.type === TypeVariation.Mute && !entry.invalidated && !entry.appealType && entry.userId === target.id
					: (entry: ModerationEntity) => entry.type === TypeVariation.Mute && !entry.invalidated && !entry.appealType;
			case Type.Warning:
				return target
					? (entry: ModerationEntity) =>
							entry.type === TypeVariation.Warning && !entry.invalidated && !entry.appealType && entry.userId === target.id
					: (entry: ModerationEntity) => entry.type === TypeVariation.Warning && !entry.invalidated && !entry.appealType;
			case Type.All:
				return target
					? (entry: ModerationEntity) => entry.duration !== null && !entry.invalidated && !entry.appealType && entry.userId === target.id
					: (entry: ModerationEntity) => entry.duration !== null && !entry.invalidated && !entry.appealType;
		}
	}
}
