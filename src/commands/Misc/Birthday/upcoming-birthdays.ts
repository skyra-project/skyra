import { SkyraCommand } from '#lib/structures';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';
import { DbSet, ScheduleEntity } from '#lib/database';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 5,
	description: LanguageKeys.Commands.Misc.UpcomingBirthdaysDescription,
	extendedHelp: LanguageKeys.Commands.Misc.UpcomingBirthdaysExtended,
	runIn: ['text']
})
export default class extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const schedules = [
			...this.context.client.schedules.queue
				.filter((schedule) => schedule.taskID === 'birthday' && schedule.data.guildID === message.guild!.id)
				.reduce((a, b) => {
					const key = b.time.getTime();
					if (a.has(key)) a.get(key)!.push(b);
					else a.set(key, [b]);
					return a;
				}, new Map<number, ScheduleEntity[]>())
				.entries()
		].sort((a, b) => (a[0] > b[0] ? -1 : 1)) as [number, ScheduleEntity[]][];

		if (schedules.length === 0) return this.error(LanguageKeys.Commands.Misc.UpcomingBirthdaysNone);
		const embed = new MessageEmbed()
			.setColor(await DbSet.fetchColor(message))
			.setTitle(args.t(LanguageKeys.Commands.Misc.UpcomingBirthdaysTitle));

		for (const [time, users] of schedules.slice(0, 10)) {
			const birthday = new Date(Number(time));
			embed.addField(
				args.t(LanguageKeys.Globals.DateValue, { value: birthday }),
				users
					.map(
						(schedule) =>
							`<@${schedule.data.userID}> (${new Date().getFullYear() - new Date(schedule.data.birthDate as string).getFullYear()})`
					)
					.join('\n')
			);
		}
		return message.send(embed);
	}
}
