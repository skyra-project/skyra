import { getGuildMemberBirthday } from '#lib/birthday';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandContext } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['viewbday'],
	description: LanguageKeys.Commands.Misc.ViewBirthdayDescription,
	extendedHelp: LanguageKeys.Commands.Misc.ViewBirthdayExtended,
	runIn: ['GUILD_ANY']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args, context: CommandContext) {
		const user = args.finished ? message.author : await args.pick('userName');
		const task = getGuildMemberBirthday(message.guild.id, user.id);
		const content = task
			? args.t(LanguageKeys.Commands.Misc.ViewBirthdaySet, { birthDate: task.time.getTime(), user: user.toString() })
			: args.t(LanguageKeys.Commands.Misc.ViewBirthdayNotSet, { user: user.tag, prefix: context.commandPrefix });

		return send(message, { content, allowedMentions: { users: [], roles: [] } });
	}
}
