import { DbSet, ScheduleEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { GuildMessage } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 10,
	description: LanguageKeys.Commands.Misc.UpcomingBirthdaysDescription,
	extendedHelp: LanguageKeys.Commands.Misc.UpcomingBirthdaysExtended,
	runIn: ['text']
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const schedules = [
			...this.context.client.schedules.queue
				.filter((schedule) => schedule.taskID === 'birthday' && schedule.data.guildID === message.guild.id)
				.reduce((a, b) => {
					const key = b.time.getTime();
					const valueAtA = a.get(key);
					valueAtA ? valueAtA.push(b) : a.set(key, [b]);
					return a;
				}, new Map<number, ScheduleEntity[]>())
				.entries()
		].sort((a, b) => (a[0] > b[0] ? -1 : 1)) as [number, ScheduleEntity[]][];

		if (schedules.length === 0) return this.error(LanguageKeys.Commands.Misc.UpcomingBirthdaysNone);
		const embed = new MessageEmbed()
			.setColor(await DbSet.fetchColor(message))
			.setTitle(args.t(LanguageKeys.Commands.Misc.UpcomingBirthdaysTitle));

		for (const [time, users] of schedules.reverse().slice(0, 10)) {
			const birthday = new Date(time);
			embed.addField(
				args.t(LanguageKeys.Globals.DateValue, { value: birthday }),
				users.map((schedule) => `<@${schedule.data.userID}> (${this.calculateAge(new Date(schedule.data.birthDate as string))})`).join('\n')
			);
		}
		return message.send(embed);
	}

	private calculateAge = (birthday: Date): number => {
		const ageDifMs = Date.now() - birthday.getTime();
		const ageDate = new Date(ageDifMs);
		return Math.abs(ageDate.getUTCFullYear() - 1970) + 1;
	};
}
