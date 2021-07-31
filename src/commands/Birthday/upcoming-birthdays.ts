import { BirthdayScheduleEntity, getAge, getGuildBirthdays } from '#lib/birthday';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { reduce } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandContext } from '@sapphire/framework';
import { send } from '@skyra/editable-commands';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['upbday', 'birthdays'],
	description: LanguageKeys.Commands.Misc.UpcomingBirthdaysDescription,
	extendedHelp: LanguageKeys.Commands.Misc.UpcomingBirthdaysExtended,
	runIn: ['GUILD_ANY']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args, context: CommandContext) {
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

		for (const [time, users] of schedules.slice(-10).reverse()) {
			const birthday = new Date(time);
			embed.addField(
				args.t(LanguageKeys.Globals.DateValue, { value: birthday }),
				users
					.map((schedule) => {
						const calculatedAge = getAge(schedule.data, { now: time });
						const age = calculatedAge === null ? args.t(LanguageKeys.Globals.Unknown) : calculatedAge + 1;

						return `<@${schedule.data.userId}> (${age})`;
					})
					.join('\n')
			);
		}

		return send(message, { embeds: [embed] });
	}
}
