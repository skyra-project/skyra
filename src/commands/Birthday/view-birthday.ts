import { SkyraCommand } from '#lib/structures';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@sapphire/decorators';
import { GuildMessage } from '#lib/types';
import { CommandContext } from '@sapphire/framework';
import { getGuildMemberBirthday } from '#lib/birthday';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 10,
	description: LanguageKeys.Commands.Misc.ViewBirthdayDescription,
	extendedHelp: LanguageKeys.Commands.Misc.ViewBirthdayExtended,
	runIn: ['text']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args, context: CommandContext) {
		const user = args.finished ? message.author : await args.pick('userName');
		const task = getGuildMemberBirthday(message.guild.id, user.id);

		return message.send(
			task
				? (args.t(LanguageKeys.Commands.Misc.ViewBirthdaySet, {
						birthDate: task.time.getTime(),
						user: user.tag
				  }) as string)
				: (args.t(LanguageKeys.Commands.Misc.ViewBirthdayNotSet, { user: user.tag, prefix: context.commandPrefix }) as string)
		);
	}
}
