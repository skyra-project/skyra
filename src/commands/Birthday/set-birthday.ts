import { getDateFormat, getGuildMemberBirthday, monthOfYearContainsDay, nextBirthday, removeYear, TaskBirthdayData, yearIsLeap } from '#lib/birthday';
import { readSettings } from '#lib/database';
import { Birthday } from '#lib/database/keys/settings/All';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, CommandContext } from '@sapphire/framework';
import { isNullish, Nullish } from '@sapphire/utilities';
import { send } from '@skyra/editable-commands';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['setbday', 'bd', 'birthday'],
	description: LanguageKeys.Commands.Misc.SetBirthdayDescription,
	extendedHelp: LanguageKeys.Commands.Misc.SetBirthdayExtended,
	runIn: ['GUILD_ANY']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args, context: CommandContext) {
		const [birthdayRole, birthdayChannel, birthdayMessage] = await readSettings(message.guild, [
			Birthday.Role,
			Birthday.Channel,
			Birthday.Message
		]);
		if (!this.isCorrectlyConfigured(birthdayRole, birthdayChannel, birthdayMessage))
			this.error(LanguageKeys.Commands.Misc.SetBirthdayNotConfigured, { prefix: context.commandPrefix });

		const date = await args.pick(UserCommand.dateWithOptionalYear);

		// Delete the previous birthday task, if any
		const currentTask = getGuildMemberBirthday(message.guild.id, message.author.id);
		if (currentTask) await this.container.schedule.remove(currentTask);

		const birthday = nextBirthday(date.month, date.day);
		await this.container.schedule.add('birthday', birthday, { data: this.constructData(date, message) });
		return send(message, args.t(LanguageKeys.Commands.Misc.SetBirthdaySuccess, { nextBirthday: birthday.getTime() }));
	}

	private constructData(birthDate: DateWithOptionalYear, message: GuildMessage): TaskBirthdayData {
		return {
			guildId: message.guild.id,
			userId: message.author.id,
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
