import { SkyraCommand } from '#lib/structures';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';
import { DbSet, ScheduleEntity } from '#lib/database';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 5,
	description: LanguageKeys.Commands.Misc.UpcomingBirthdaysDescription,
	extendedHelp: LanguageKeys.Commands.Misc.UpcomingBirthdaysExtended
})
export default class extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const schedules = Object.entries(
			this.context.client.schedules.queue
				.filter((schedule) => schedule.taskID === 'birthday' && schedule.data.guildID === message.guild!.id)
				.reduce((a, b) => {
					const key = b.time.getTime();
					if (Reflect.has(a, key)) Reflect.get(a, key).push(b);
					else Reflect.set(a, key, [b]);
					return a;
				}, {})
		).sort((a, b) => (Number(a) > Number(b) ? -1 : 1)) as [string, ScheduleEntity[]][];

		if (schedules.length === 0) return this.error(LanguageKeys.Commands.Misc.UpcomingBirthdaysNone);
		const embed = new MessageEmbed()
			.setColor(await DbSet.fetchColor(message))
			.setTitle(args.t(LanguageKeys.Commands.Misc.UpcomingBirthdaysTitle));

		for (const [time, users] of schedules.slice(0, 10)) {
			const birthday = new Date(Number(time));
			embed.addField(
				args.t(LanguageKeys.Globals.DateValue, { value: birthday }),
				users
					.map((schedule) => {
						console.log(schedule.data);
						return `<@${schedule.data.userID}> (${new Date().getFullYear() - new Date(schedule.data.birthDate as string).getFullYear()})`;
					})
					.join('\n')
			);
		}
		return message.send(embed);
	}
}
