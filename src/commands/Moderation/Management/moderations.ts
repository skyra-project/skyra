import { DbSet, ModerationEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { Moderation } from '#utils/constants';
import { sendLoadingMessage } from '#utils/util';
import type Collection from '@discordjs/collection';
import { ApplyOptions } from '@sapphire/decorators';
import { chunk, cutText } from '@sapphire/utilities';
import { MessageEmbed, User } from 'discord.js';

const enum Type {
	Mute,
	Warning,
	All
}

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['moderation'],
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Moderation.ModerationsDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.ModerationsExtended,
	permissionLevel: PermissionLevels.Moderator,
	subCommands: [
		{ input: 'mute', output: 'mutes' },
		'mutes',
		{ input: 'warning', output: 'warnings' },
		'warnings',
		{ input: 'warn', output: 'warnings' },
		{ input: 'warns', output: 'warnings' },
		{ input: 'all', default: true }
	]
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public mutes(message: GuildMessage, args: PaginatedMessageCommand.Args, { commandPrefix }: PaginatedMessageCommand.Context) {
		return this.handle(message, args, Type.Mute, commandPrefix);
	}

	public warnings(message: GuildMessage, args: PaginatedMessageCommand.Args, { commandPrefix }: PaginatedMessageCommand.Context) {
		return this.handle(message, args, Type.Warning, commandPrefix);
	}

	public all(message: GuildMessage, args: PaginatedMessageCommand.Args, { commandPrefix }: PaginatedMessageCommand.Context) {
		return this.handle(message, args, Type.All, commandPrefix);
	}

	private async handle(message: GuildMessage, args: PaginatedMessageCommand.Args, action: Type, prefix: string) {
		const target = args.finished ? null : await args.pick('userName');

		const response = await sendLoadingMessage(message, args.t);
		const entries = (await (target ? message.guild.moderation.fetch(target.id) : message.guild.moderation.fetch())).filter(
			this.getFilter(action, target)
		);

		if (!entries.size) this.error(LanguageKeys.Commands.Moderation.ModerationsEmpty, { prefix });

		const user = this.context.client.user!;
		const display = new UserPaginatedMessage({
			template: new MessageEmbed()
				.setColor(await this.context.db.fetchColor(message))
				.setAuthor(user.username, user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setTitle(args.t(LanguageKeys.Commands.Moderation.ModerationsAmount, { count: entries.size }))
		});

		// Fetch usernames
		const usernames = await (target ? this.fetchAllModerators(entries) : this.fetchAllUsers(entries));

		// Set up the formatter
		const durationDisplay = (value: number) => args.t(LanguageKeys.Globals.DurationValue, { value });
		const displayName = action === Type.All;
		const format = target
			? this.displayModerationLogFromModerators.bind(this, usernames, durationDisplay, displayName)
			: this.displayModerationLogFromUsers.bind(this, usernames, durationDisplay, displayName);

		for (const page of chunk([...entries.values()], 10)) {
			display.addPageEmbed((template) => {
				for (const entry of page) {
					const { name, value } = format(entry);
					template.addField(name, value);
				}

				return template;
			});
		}

		await display.start(response as GuildMessage, message.author);
		return response;
	}

	private displayModerationLogFromModerators(users: Map<string, string>, duration: DurationDisplay, displayName: boolean, entry: ModerationEntity) {
		const appealOrInvalidated = entry.appealType || entry.invalidated;
		const remainingTime =
			appealOrInvalidated || entry.duration === null || entry.createdAt === null ? null : entry.createdTimestamp + entry.duration! - Date.now();
		const expiredTime = remainingTime !== null && remainingTime <= 0;
		const formattedModerator = users.get(entry.moderatorID!);
		const formattedReason = entry.reason ? cutText(entry.reason, 800) : 'None';
		const formattedDuration = remainingTime === null || expiredTime ? '' : `\nExpires in: ${duration(remainingTime)}`;
		const formatter = appealOrInvalidated || expiredTime ? '~~' : '';

		return {
			name: `\`${entry.caseID}\`${displayName ? ` | ${entry.title}` : ''}`,
			value: `${formatter}Moderator: **${formattedModerator}**.\n${formattedReason}${formattedDuration}${formatter}`
		};
	}

	private displayModerationLogFromUsers(users: Map<string, string>, duration: DurationDisplay, displayName: boolean, entry: ModerationEntity) {
		const appealOrInvalidated = entry.appealType || entry.invalidated;
		const remainingTime =
			appealOrInvalidated || entry.duration === null || entry.createdAt === null ? null : entry.createdTimestamp + entry.duration! - Date.now();
		const expiredTime = remainingTime !== null && remainingTime <= 0;
		const formattedUser = users.get(entry.userID!);
		const formattedReason = entry.reason ? cutText(entry.reason, 800) : 'None';
		const formattedDuration = remainingTime === null || expiredTime ? '' : `\nExpires in: ${duration(remainingTime)}`;
		const formatter = appealOrInvalidated || expiredTime ? '~~' : '';

		return {
			name: `\`${entry.caseID}\`${displayName ? ` | ${entry.title}` : ''}`,
			value: `${formatter}Moderator: **${formattedUser}**.\n${formattedReason}${formattedDuration}${formatter}`
		};
	}

	private async fetchAllUsers(entries: Collection<number, ModerationEntity>) {
		const users = new Map() as Map<string, string>;
		for (const entry of entries.values()) {
			const id = entry.userID!;
			if (!users.has(id)) users.set(id, (await entry.fetchUser()).username);
		}
		return users;
	}

	private async fetchAllModerators(entries: Collection<number, ModerationEntity>) {
		const moderators = new Map() as Map<string, string>;
		for (const entry of entries.values()) {
			const id = entry.moderatorID!;
			if (!moderators.has(id)) moderators.set(id, (await entry.fetchModerator()).username);
		}
		return moderators;
	}

	private getFilter(type: Type, target: User | null) {
		switch (type) {
			case Type.Mute:
				return target
					? (entry: ModerationEntity) =>
							entry.isType(Moderation.TypeCodes.Mute) && !entry.invalidated && !entry.appealType && entry.userID === target.id
					: (entry: ModerationEntity) => entry.isType(Moderation.TypeCodes.Mute) && !entry.invalidated && !entry.appealType;
			case Type.Warning:
				return target
					? (entry: ModerationEntity) =>
							entry.isType(Moderation.TypeCodes.Warning) && !entry.invalidated && !entry.appealType && entry.userID === target.id
					: (entry: ModerationEntity) => entry.isType(Moderation.TypeCodes.Warning) && !entry.invalidated && !entry.appealType;
			case Type.All:
				return target
					? (entry: ModerationEntity) => entry.duration !== null && !entry.invalidated && !entry.appealType && entry.userID === target.id
					: (entry: ModerationEntity) => entry.duration !== null && !entry.invalidated && !entry.appealType;
		}
	}
}

type DurationDisplay = (time: number) => string;
