import { SkyraCommand } from '#lib/structures';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 5,
	description: LanguageKeys.Commands.Misc.ViewBirthdayDescription,
	extendedHelp: LanguageKeys.Commands.Misc.ViewBirthdayExtended
})
export default class extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const user = args.finished ? message.author! : await args.pick('userName');
		const birthDate = this.context.client.schedules.queue.find(
			(schedule) => schedule.taskID === 'birthday' && schedule.data.guildID === message.guild!.id && schedule.data.userID === user.id
		)?.time;

		return message.send(
			// @ts-ignore i have no idea what causes this
			args.t(birthDate ? LanguageKeys.Commands.Misc.ViewBirthdaySet : LanguageKeys.Commands.Misc.ViewBirthdayNotSet, {
				birthDate: birthDate ? birthDate.getTime() : null,
				user: user.tag
			})
		);
	}
}
