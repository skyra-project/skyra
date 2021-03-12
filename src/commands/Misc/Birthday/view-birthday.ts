import { SkyraCommand } from '#lib/structures';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@sapphire/decorators';
import { GuildMessage } from '#lib/types';
import { CommandContext } from '@sapphire/framework';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 10,
	description: LanguageKeys.Commands.Misc.ViewBirthdayDescription,
	extendedHelp: LanguageKeys.Commands.Misc.ViewBirthdayExtended,
	runIn: ['text']
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args, context: CommandContext) {
		const user = args.finished ? message.author : await args.pick('userName');
		const birthDate = this.context.client.schedules.queue.find(
			(schedule) => schedule.taskID === 'birthday' && schedule.data.guildID === message.guild.id && schedule.data.userID === user.id
		)?.time;

		return message.send(
			birthDate
				? (args.t(LanguageKeys.Commands.Misc.ViewBirthdaySet, {
						birthDate: birthDate.getTime(),
						user: user.tag
				  }) as string)
				: (args.t(LanguageKeys.Commands.Misc.ViewBirthdayNotSet, { user: user.tag, prefix: context.commandPrefix }) as string)
		);
	}
}
