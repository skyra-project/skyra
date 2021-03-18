import { getHandler } from '#languages';
import { TaskBirthDayData } from '#lib/birthday';
import { PartialResponseValue, ResponseType, Task } from '#lib/database';
import { Birthday } from '#lib/database/keys/settings/All';
import { GuildMember, TextChannel, User } from 'discord.js';

const enum Matches {
	Age = '{age}',
	AgeOrdinal = '{age.ordinal}',
	User = '{user}',
	UserName = '{user.name}',
	UserTag = '{user.tag}'
}

export class UserTask extends Task {
	private kTransformMessageRegExp = /{age}|{age\.ordinal}|{user}|{user\.name}|{user\.tag}/g;

	public async run(data: TaskBirthDayData): Promise<PartialResponseValue | null> {
		const guild = this.context.client.guilds.cache.get(data.guildID);
		if (!guild) return null;

		const member = await guild.members.fetch(data.userID);
		if (!member) return null;

		const t = await guild.fetchT();
		const [birthdayRole, birthdayChannel, birthdayMessage] = await guild.readSettings([Birthday.Role, Birthday.Channel, Birthday.Message]);
		if (!birthdayRole && !(birthdayChannel && birthdayMessage)) return null;
		const me = guild.me!;

		if (birthdayRole && me.permissions.has('MANAGE_ROLES') && me.roles.highest.position > member.roles.highest.position) {
			await this.addBirthdayRole(data, member, birthdayRole);
		}

		if (birthdayChannel && birthdayMessage) {
			const channel = guild.channels.cache.get(birthdayChannel);
			if (!channel || !channel.permissionsFor(me!)?.has('SEND_MESSAGES')) return null;
			await (channel as TextChannel).send(this.transformMessage(birthdayMessage, member.user, data.birthDate, t.lng));
		}

		const nextBirthday = this.nextBirthday();

		return { type: ResponseType.Update, value: nextBirthday };
	}

	private async addBirthdayRole(data: TaskBirthDayData, member: GuildMember, birthdayRole: string) {
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

	private transformMessage(message: string, user: User, birthDate: Date, language: string) {
		return message.replace(this.kTransformMessageRegExp, (match) => {
			switch (match) {
				case Matches.Age:
					return this.getAge(birthDate).toString();
				case Matches.AgeOrdinal:
					return getHandler(language).ordinal(this.getAge(birthDate));
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

	private getAge(birthDate: Date) {
		return new Date().getFullYear() - birthDate.getFullYear();
	}

	private nextBirthday() {
		const nextBirthday = new Date();
		nextBirthday.setUTCFullYear(nextBirthday.getFullYear() + 1);
		nextBirthday.setUTCHours(0);
		nextBirthday.setUTCMinutes(0);
		nextBirthday.setUTCSeconds(0);
		nextBirthday.setUTCMilliseconds(0);

		return nextBirthday;
	}
}
