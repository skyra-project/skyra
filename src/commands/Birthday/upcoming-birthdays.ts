import { BirthdayScheduleEntity, getAge, getGuildBirthdays } from '#lib/birthday';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { reduce } from '#utils/common';
import { time, TimestampStyles } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandContext, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['upbday', 'birthdays'],
	description: LanguageKeys.Commands.Misc.UpcomingBirthdaysDescription,
	detailedDescription: LanguageKeys.Commands.Misc.UpcomingBirthdaysExtended,
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraCommand {
	public async messageRun(message: GuildMessage, args: SkyraCommand.Args, context: CommandContext) {
		const schedules = [
			...reduce(
				getGuildBirthdays(message.guild.id),
				(map, b) => {
					const key = b.time.getTime();
					const valueAtA = map.get(key);
					valueAtA ? valueAtA.push(b) : map.set(key, [b]);
					return map;
				},
				new Map<number, BirthdayScheduleEntity[]>()
			).entries()
		].sort((a, b) => (a[0] > b[0] ? -1 : 1)) as [number, BirthdayScheduleEntity[]][];

		if (schedules.length === 0) this.error(LanguageKeys.Commands.Misc.UpcomingBirthdaysNone, { prefix: context.commandPrefix });
		const embed = new MessageEmbed()
			.setColor(await this.container.db.fetchColor(message))
			.setTitle(args.t(LanguageKeys.Commands.Misc.UpcomingBirthdaysTitle));

		for (const [birthdayTime, users] of schedules.slice(-10).reverse()) {
			const birthday = new Date(birthdayTime);
			embed.addField(
				time(birthday, TimestampStyles.ShortDate),
				users
					.map((schedule) => {
						const calculatedAge = getAge(schedule.data, { now: birthdayTime });
						const age = calculatedAge === null ? args.t(LanguageKeys.Globals.Unknown) : calculatedAge + 1;

						return `<@${schedule.data.userId}> (${age})`;
					})
					.join('\n')
			);
		}

		return send(message, { embeds: [embed] });
	}
}
