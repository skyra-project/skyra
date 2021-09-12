import { getGuildMemberBirthday } from '#lib/birthday';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Misc.ResetBirthdayDescription,
	detailedDescription: LanguageKeys.Commands.Misc.ResetBirthdayExtended,
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const birthdayReminder = getGuildMemberBirthday(message.guild.id, message.author.id);
		if (!birthdayReminder) return this.error(LanguageKeys.Commands.Misc.ResetBirthdayNotSet);
		await this.container.schedule.remove(birthdayReminder);
		return send(message, args.t(LanguageKeys.Commands.Misc.ResetBirthdaySuccess));
	}
}
