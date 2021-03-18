import { getAge, nextBirthday, TaskBirthdayData } from '#lib/birthday';
import { GuildSettings, PartialResponseValue, ResponseType, Task } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMember, TextChannel, User } from 'discord.js';
import type { TFunction } from 'i18next';

const enum Matches {
	Age = '{age}',
	AgeOrdinal = '{age.ordinal}',
	User = '{user}',
	UserName = '{user.name}',
	UserTag = '{user.tag}'
}

export class UserTask extends Task {
	private kTransformMessageRegExp = /{age}|{age\.ordinal}|{user}|{user\.name}|{user\.tag}/g;

	public async run(data: TaskBirthdayData): Promise<PartialResponseValue | null> {
		const guild = this.context.client.guilds.cache.get(data.guildID);
		if (!guild) return null;

		const member = await guild.members.fetch(data.userID);
		if (!member) return null;

		const t = await guild.fetchT();
		const [birthdayRole, birthdayChannel, birthdayMessage] = await guild.readSettings([
			GuildSettings.Birthday.Role,
			GuildSettings.Birthday.Channel,
			GuildSettings.Birthday.Message
		]);
		if (!birthdayRole && !(birthdayChannel && birthdayMessage)) return null;
		const me = guild.me!;

		if (birthdayRole && me.permissions.has('MANAGE_ROLES') && me.roles.highest.position > member.roles.highest.position) {
			await this.addBirthdayRole(data, member, birthdayRole);
		}

		if (birthdayChannel && birthdayMessage) {
			const channel = guild.channels.cache.get(birthdayChannel) as TextChannel | undefined;
			if (!channel || !channel.postable) return null;
			await channel.send(this.transformMessage(birthdayMessage, member.user, getAge(data), t));
		}

		const next = nextBirthday(data.month, data.day, { nextYearIfToday: true });
		return { type: ResponseType.Update, value: next };
	}

	private async addBirthdayRole(data: TaskBirthdayData, member: GuildMember, birthdayRole: string) {
		await member.roles.add(birthdayRole);
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		await this.context.client.schedules.add('removeBirthdayRole', tomorrow, {
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
