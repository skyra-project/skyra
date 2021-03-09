import { getHandler } from '#languages';
import { PartialResponseValue, ResponseType, Task } from '#lib/database';
import { TextChannel, User } from 'discord.js';

const enum Matches {
	Age = '{age}',
	AgeOrdinal = '{ageOrdinal}',
	User = '{user}'
}

export class UserTask extends Task {
	private kTransformMessageRegExp = /{age}|{ageOrdinal}|{user}/g;

	public async run(data: BirthdayTaskData): Promise<PartialResponseValue | null> {
		const guild = this.context.client.guilds.cache.get(data.guildID);
		if (!guild) return null;
		const member = await guild.members.fetch(data.userID);
		if (!member) return null;

		const t = await guild.fetchT();
		const [birthdayRole, birthdayChannel, birthdayMessage] = await guild.readSettings(['birthdayRole', 'birthdayChannel', 'birthdayMessage']);
		if (!birthdayRole && !(birthdayChannel && birthdayMessage)) return null;
		const { me } = guild;

		if (birthdayRole && me?.permissions.has('MANAGE_ROLES') && me?.roles.highest.position > member.roles.highest.position) {
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

		if (birthdayChannel && birthdayMessage) {
			const channel = guild.channels.cache.get(birthdayChannel);
			if (!channel || !channel.permissionsFor(me!)?.has('SEND_MESSAGES')) return null;
			await (channel as TextChannel).send(this.transformMessage(birthdayMessage, member.user, data.birthDate, t.lng));
		}
		// next year's birthday
		const nextBirthday = new Date();
		nextBirthday.setUTCFullYear(nextBirthday.getFullYear() + 1);
		nextBirthday.setUTCHours(0);
		nextBirthday.setUTCMinutes(0);
		nextBirthday.setUTCSeconds(0);
		nextBirthday.setUTCMilliseconds(0);

		return { type: ResponseType.Update, value: nextBirthday };
	}

	private transformMessage(message: string, user: User, birthDate: Date, language: string) {
		return message.replace(this.kTransformMessageRegExp, (match) => {
			switch (match) {
				case Matches.Age:
					return this.getAge(birthDate).toString();
				case Matches.AgeOrdinal:
					return getHandler(language).ordinal(this.getAge(birthDate));
				case Matches.User:
					return user.username;
				default:
					return match;
			}
		});
	}

	private getAge(birthDate: Date) {
		return new Date().getFullYear() - birthDate.getFullYear();
	}
}

interface BirthdayTaskData extends Record<string, unknown> {
	birthDate: Date;
	guildID: string;
	userID: string;
}
