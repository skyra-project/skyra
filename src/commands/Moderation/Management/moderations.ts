import Collection from '@discordjs/collection';
import { ModerationEntity } from '@lib/database/entities/ModerationEntity';
import { DbSet } from '@lib/structures/DbSet';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { chunk, cutText } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors, Moderation } from '@utils/constants';
import { pickRandom } from '@utils/util';
import { MessageEmbed, User } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['moderation'],
	bucket: 2,
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Moderation.ModerationsDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Moderation.ModerationsExtended),
	permissionLevel: PermissionLevels.Moderator,
	requiredPermissions: ['MANAGE_MESSAGES'],
	runIn: ['text'],
	usage: '<mutes|warnings|warns|all:default> [user:username]'
})
export default class extends RichDisplayCommand {
	public async run(message: KlasaMessage, [action, target]: ['mutes' | 'warnings' | 'warns' | 'all', User?]) {
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(pickRandom(message.language.get(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const entries = (await (target ? message.guild!.moderation.fetch(target.id) : message.guild!.moderation.fetch())).filter(
			this.getFilter(action, target)
		);
		if (!entries.size) throw message.language.get(LanguageKeys.Commands.Moderation.ModerationsEmpty);

		const display = new UserRichDisplay(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setAuthor(this.client.user!.username, this.client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setTitle(
					message.language.get(
						entries.size === 1
							? LanguageKeys.Commands.Moderation.ModerationsAmount
							: LanguageKeys.Commands.Moderation.ModerationsAmountPlural,
						{ count: entries.size }
					)
				)
		);

		// Fetch usernames
		const usernames = await (target ? this.fetchAllModerators(entries) : this.fetchAllUsers(entries));

		// Set up the formatter
		const durationDisplay = message.language.duration.bind(message.language);
		const displayName = action === 'all';
		const format = target
			? this.displayModerationLogFromModerators.bind(this, usernames, durationDisplay, displayName)
			: this.displayModerationLogFromUsers.bind(this, usernames, durationDisplay, displayName);

		for (const page of chunk([...entries.values()], 10)) {
			display.addPage((template: MessageEmbed) => {
				for (const entry of page) {
					const { name, value } = format(entry);
					template.addField(name, value);
				}

				return template;
			});
		}

		await display.start(response, message.author.id);
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

	private getFilter(type: 'mutes' | 'warnings' | 'warns' | 'all', target: User | undefined) {
		switch (type) {
			case 'mutes':
				return target
					? (entry: ModerationEntity) =>
							entry.isType(Moderation.TypeCodes.Mute) && !entry.invalidated && !entry.appealType && entry.userID === target.id
					: (entry: ModerationEntity) => entry.isType(Moderation.TypeCodes.Mute) && !entry.invalidated && !entry.appealType;
			case 'warns':
			case 'warnings':
				return target
					? (entry: ModerationEntity) =>
							entry.isType(Moderation.TypeCodes.Warning) && !entry.invalidated && !entry.appealType && entry.userID === target.id
					: (entry: ModerationEntity) => entry.isType(Moderation.TypeCodes.Warning) && !entry.invalidated && !entry.appealType;
			case 'all':
			default:
				return target
					? (entry: ModerationEntity) => entry.duration !== null && !entry.invalidated && !entry.appealType && entry.userID === target.id
					: (entry: ModerationEntity) => entry.duration !== null && !entry.invalidated && !entry.appealType;
		}
	}
}

type DurationDisplay = (time: number) => string;
