import { getDateFormat, getGuildMemberBirthday, monthOfYearContainsDay, nextBirthday, removeYear, TaskBirthdayData, yearIsLeap } from '#lib/birthday';
import { Birthday } from '#lib/database/keys/settings/All';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { GuildMessage } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, CommandContext } from '@sapphire/framework';
import { isNullish, Nullish } from '@sapphire/utilities';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['setbday', 'birthday'],
	cooldown: 10,
	description: LanguageKeys.Commands.Misc.SetBirthdayDescription,
	extendedHelp: LanguageKeys.Commands.Misc.SetBirthdayExtended,
	runIn: ['text']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args, context: CommandContext) {
		const [birthdayRole, birthdayChannel, birthdayMessage] = await message.guild.readSettings([
			Birthday.Role,
			Birthday.Channel,
			Birthday.Message
		]);
		if (!this.isCorrectlyConfigured(birthdayRole, birthdayChannel, birthdayMessage))
			this.error(LanguageKeys.Commands.Misc.SetBirthdayNotConfigured, { prefix: context.commandPrefix });

		const date = await args.pick(UserCommand.dateWithOptionalYear);

		// Delete the previous birthday task, if any
		const currentTask = getGuildMemberBirthday(message.guild.id, message.author.id);
		if (currentTask) await this.context.schedule.remove(currentTask);

		const birthday = nextBirthday(date.month, date.day);
		await this.context.schedule.add('birthday', birthday, { data: this.constructData(date, message) });
		return message.send(args.t(LanguageKeys.Commands.Misc.SetBirthdaySuccess, { nextBirthday: birthday.getTime() }));
	}

	private constructData(birthDate: DateWithOptionalYear, message: GuildMessage): TaskBirthdayData {
		return {
			guildID: message.guild.id,
			userID: message.author.id,
			year: birthDate.year,
			month: birthDate.month,
			day: birthDate.day
		};
	}

	private isCorrectlyConfigured(birthdayRole: string | Nullish, birthdayChannel: string | Nullish, birthdayMessage: string | Nullish) {
		// A birthday role, or a channel and message must be configured:
		return !isNullish(birthdayRole) || (!isNullish(birthdayChannel) && !isNullish(birthdayMessage));
	}

	private static readonly dateWithOptionalYear = Args.make<DateWithOptionalYear>((parameter, { argument, args }) => {
		const format = args.t(LanguageKeys.Globals.DateFormat);
		const regExp = getDateFormat(format, args.t.lng);
		const result = regExp.exec(parameter);
		if (result === null) {
			return Args.error({
				argument,
				parameter,
				identifier: LanguageKeys.Commands.Misc.SetBirthdayInvalidDate,
				context: { formatWithYear: format, formatWithoutYear: removeYear(format) }
			});
		}

		const year = result.groups!.year === undefined ? null : Number(result.groups!.year);
		if (year !== null && (year < 1903 || year > new Date().getUTCFullYear())) {
			return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.Misc.SetBirthdayInvalidYear });
		}

		const month = Number(result.groups!.month);
		if (month <= 0 || month > 12) {
			return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.Misc.SetBirthdayInvalidMonth });
		}

		const day = Number(result.groups!.day);
		if (day <= 0 || !monthOfYearContainsDay(year === null ? true : yearIsLeap(year), month, day)) {
			return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.Misc.SetBirthdayInvalidDay, context: { year, month } });
		}

		return Args.ok({ year, month, day });
	});
}

interface DateWithOptionalYear {
	year: number | null;
	month: number;
	day: number;
}
