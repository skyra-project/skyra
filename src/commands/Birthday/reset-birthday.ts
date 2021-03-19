import { getGuildMemberBirthday } from '#lib/birthday';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { GuildMessage } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 10,
	description: LanguageKeys.Commands.Misc.ResetBirthdayDescription,
	extendedHelp: LanguageKeys.Commands.Misc.ResetBirthdayExtended,
	runIn: ['text']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const birthdayReminder = getGuildMemberBirthday(message.guild.id, message.author.id);
		if (!birthdayReminder) return this.error(LanguageKeys.Commands.Misc.ResetBirthdayNotSet);
		await this.context.schedule.remove(birthdayReminder);
		return message.send(args.t(LanguageKeys.Commands.Misc.ResetBirthdaySuccess));
	}
}
