import { getGuildMemberBirthDay, monthOfYearContainsDay, nextBirthday, TaskBirthDayData, yearIsLeap } from '#lib/birthday';
import { Birthday } from '#lib/database/keys/settings/All';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { GuildMessage } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, CommandContext } from '@sapphire/framework';
import { isNullish, Nullish } from '@sapphire/utilities';

@ApplyOptions<SkyraCommand.Options>({
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
		if (this.isCorrectlyConfigured(birthdayRole, birthdayChannel, birthdayMessage))
			return this.error(LanguageKeys.Commands.Misc.SetBirthdayNotConfigured, { prefix: context.commandPrefix });

		const date = await this.handleArguments(args);

		// delete any existing reminders
		const currentTask = getGuildMemberBirthDay(message.guild.id, message.author.id);
		if (currentTask) await this.context.client.schedules.remove(currentTask);

		const birthday = nextBirthday(date.month, date.day);
		await this.context.client.schedules.add('birthday', birthday, {
			data: this.constructData(date, message)
		});
		return message.send(args.t(LanguageKeys.Commands.Misc.SetBirthdaySuccess, { nextBirthday: birthday.getTime() }));
	}

	private constructData(birthDate: DateWithOptionalYear, message: GuildMessage): TaskBirthDayData {
		return {
			guildID: message.guild.id,
			userID: message.author.id,
			year: birthDate.year,
			month: birthDate.month,
			day: birthDate.day
		};
	}

	private async handleArguments(args: SkyraCommand.Args): Promise<DateWithOptionalYear> {
		const result = await args.pickResult(UserCommand.dateWithOptionalYear);
		if (result.success) return result.value;

		const birthDate = await args.rest('date');

		// The world's oldest human alive was born in January 1903:
		if (birthDate.getTime() > Date.now() || birthDate.getFullYear() < 1903) this.error(LanguageKeys.Commands.Misc.SetBirthdayInvalidDate);

		return { year: birthDate.getUTCFullYear(), month: birthDate.getUTCMonth() + 1, day: birthDate.getUTCDate() };
	}

	private isCorrectlyConfigured(birthdayRole: string | Nullish, birthdayChannel: string | Nullish, birthdayMessage: string | Nullish) {
		// A birthday role, or a channel and message must be configured:
		return !isNullish(birthdayRole) || (!isNullish(birthdayChannel) && !isNullish(birthdayMessage));
	}

	private static readonly currentYear = new Date().getUTCFullYear();
	private static readonly dateRegExp = /^(?:(\d{4})[-/])?(\d{1,2})[-/](\d{1,2})/;
	private static dateWithOptionalYear = Args.make<DateWithOptionalYear>((parameter, { argument }) => {
		const result = this.dateRegExp.exec(parameter);
		if (result === null) return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.Misc.SetBirthdayInvalidDate });

		const year = result[1] === undefined ? null : Number(result[1]);
		if (year !== null && (year < 1903 || year > this.currentYear)) {
			return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.Misc.SetBirthdayInvalidYear });
		}

		const month = Number(result[2]);
		if (month <= 0 || month > 12) {
			return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.Misc.SetBirthdayInvalidMonth });
		}

		const day = Number(result[3]);
		if (day <= 0 || !monthOfYearContainsDay(year === null ? true : yearIsLeap(year), month, day)) {
			return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.Misc.SetBirthdayInvalidDay });
		}

		return Args.ok({ year, month, day });
	});
}

interface DateWithOptionalYear {
	year: number | null;
	month: number;
	day: number;
}
