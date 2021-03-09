import { SkyraCommand } from '#lib/structures';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 5,
	description: LanguageKeys.Commands.Misc.ResetBirthdayDescription,
	extendedHelp: LanguageKeys.Commands.Misc.ResetBirthdayExtended
})
export default class extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const birthdayReminder = this.context.client.schedules.queue.find(
			(schedule) => schedule.taskID === 'birthday' && schedule.data.guildID === message.guild!.id && schedule.data.userID === message.author.id
		);
		if (!birthdayReminder) return this.error(LanguageKeys.Commands.Misc.ResetBirthdayNotSet);
		await this.context.client.schedules.remove(birthdayReminder);
		return message.send(args.t(LanguageKeys.Commands.Misc.ResetBirthdaySuccess));
	}
}
