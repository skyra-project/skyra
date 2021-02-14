import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { announcementCheck } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 15,
	description: LanguageKeys.Commands.Announcement.UnsubscribeDescription,
	extendedHelp: LanguageKeys.Commands.Announcement.UnsubscribeExtended,
	permissions: ['MANAGE_ROLES'],
	runIn: ['text']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const role = await announcementCheck(message);
		await message.member.roles.remove(role);
		return message.send(args.t(LanguageKeys.Commands.Announcement.UnsubscribeSuccess, { role: role.name }));
	}
}
