import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { GuildMessage } from '@lib/types';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { announcementCheck } from '@utils/util';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 15,
	description: (language) => language.get(LanguageKeys.Commands.Announcement.UnsubscribeDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Announcement.UnsubscribeExtended),
	requiredGuildPermissions: ['MANAGE_ROLES'],
	runIn: ['text']
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage) {
		const role = announcementCheck(message);
		await message.member.roles.remove(role);
		return message.sendLocale(LanguageKeys.Commands.Announcement.UnsubscribeSuccess, [{ role: role.name }]);
	}
}
