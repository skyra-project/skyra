import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { GuildMessage } from '#lib/types';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { announcementCheck } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 15,
	description: LanguageKeys.Commands.Announcement.UnsubscribeDescription,
	extendedHelp: LanguageKeys.Commands.Announcement.UnsubscribeExtended,
	requiredGuildPermissions: ['MANAGE_ROLES'],
	runIn: ['text']
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage) {
		const role = await announcementCheck(message);
		await message.member.roles.remove(role);
		return message.sendTranslated(LanguageKeys.Commands.Announcement.UnsubscribeSuccess, [{ role: role.name }]);
	}
}
