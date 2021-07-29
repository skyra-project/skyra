import { getAge, nextBirthday, TaskBirthdayData } from '#lib/birthday';
import { GuildSettings, PartialResponseValue, readSettings, ResponseType, Task, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { canSendMessages } from '#utils/functions';
import { isNullish, Nullish } from '@sapphire/utilities';
import type { GuildMember, TextChannel, User } from 'discord.js';
import type { TFunction } from 'i18next';

const enum Matches {
	Age = '{age}',
	AgeOrdinal = '{age.ordinal}',
	User = '{user}',
	UserName = '{user.name}',
	UserTag = '{user.tag}'
}

const enum PartResult {
	NotSet,
	Invalid,
	Success
}

export class UserTask extends Task {
	private kTransformMessageRegExp = /{age}|{age\.ordinal}|{user}|{user\.name}|{user\.tag}/g;

	public async run(data: TaskBirthdayData): Promise<PartialResponseValue | null> {
		const guild = this.context.client.guilds.cache.get(data.guildID);
		if (!guild) return null;

		const member = await guild.members.fetch(data.userID);
		if (!member) return null;

		const [birthdayRole, birthdayChannel, birthdayMessage, t] = await readSettings(guild, (settings) => [
			settings[GuildSettings.Birthday.Role],
			settings[GuildSettings.Birthday.Channel],
			settings[GuildSettings.Birthday.Message],
			settings.getLanguage()
		]);
		if (!this.isCorrectlyConfigured(birthdayRole, birthdayChannel, birthdayMessage)) return null;

		const results = await Promise.all([
			this.handleRole(data, member, birthdayRole),
			this.handleMessage(data, member, birthdayChannel, birthdayMessage, t)
		]);

		// If there was no success (unset or invalid results), we remove the task:
		const success = results.includes(PartResult.Success);
		if (!success) return null;

		// Re-schedule the task as there was at least one success:
		const next = nextBirthday(data.month, data.day, { nextYearIfToday: true });
		return { type: ResponseType.Update, value: next };
	}

	private isCorrectlyConfigured(birthdayRole: string | Nullish, birthdayChannel: string | Nullish, birthdayMessage: string | Nullish) {
		// A birthday role, or a channel and message must be configured:
		return !isNullish(birthdayRole) || (!isNullish(birthdayChannel) && !isNullish(birthdayMessage));
	}

	private async handleRole(data: TaskBirthdayData, member: GuildMember, roleID: string | Nullish): Promise<PartResult> {
		if (isNullish(roleID)) return PartResult.NotSet;

		const role = member.guild.roles.cache.get(roleID);

		// If the role doesn't exist anymore, reset:
		if (!role) {
			await writeSettings(member, [[GuildSettings.Birthday.Role, null]]);
			return PartResult.Invalid;
		}

		// If the role can be given, add it to the user:
		if (member.guild.me!.roles.highest.position > role.position) {
			await this.addBirthdayRole(data, member, role.id);
		}

		return PartResult.Success;
	}

	private async handleMessage(
		data: TaskBirthdayData,
		member: GuildMember,
		channelID: string | Nullish,
		content: string | Nullish,
		t: TFunction
	): Promise<PartResult> {
		if (isNullish(channelID) || isNullish(content)) return PartResult.NotSet;

		const channel = member.guild.channels.cache.get(channelID) as TextChannel | undefined;

		// If the channel doesn't exist anymore, reset:
		if (!channel) {
			await writeSettings(member, [[GuildSettings.Birthday.Channel, null]]);
			return PartResult.Invalid;
		}

		// If the channel is postable, send the message:
		if (canSendMessages(channel)) {
			await channel.send(this.transformMessage(content, member.user, getAge(data), t));
		}

		return PartResult.Success;
	}

	private async addBirthdayRole(data: TaskBirthdayData, member: GuildMember, birthdayRole: string) {
		await member.roles.add(birthdayRole);
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		await this.context.schedule.add('removeBirthdayRole', tomorrow, {
			data: {
				guildID: data.guildID,
				roleID: birthdayRole,
				userID: data.userID
			}
		});
	}

	private transformMessage(message: string, user: User, age: number | null, t: TFunction) {
		return message.replace(this.kTransformMessageRegExp, (match) => {
			switch (match) {
				case Matches.Age:
					return age === null ? t(LanguageKeys.Globals.Unknown) : age.toString();
				case Matches.AgeOrdinal:
					return age === null ? t(LanguageKeys.Globals.Unknown) : t(LanguageKeys.Globals.OrdinalValue, { value: age });
				case Matches.User:
					return user.toString();
				case Matches.UserName:
					return user.username;
				case Matches.UserTag:
					return user.tag;
				default:
					return match;
			}
		});
	}
}
