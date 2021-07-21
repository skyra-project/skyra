import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { sendTemporaryMessage } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['nickname'],
	cooldown: 30,
	description: LanguageKeys.Commands.Management.NickDescription,
	extendedHelp: LanguageKeys.Commands.Management.NickExtended,
	permissionLevel: PermissionLevels.Moderator,
	permissions: ['CHANGE_NICKNAME'],
	runIn: ['text', 'news']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const nickname = await args.pick('string', { maximum: 32 }).catch(() => '');
		await message.guild.me!.setNickname(nickname);

		const content = nickname
			? args.t(LanguageKeys.Commands.Management.NickSet, { nickname })
			: args.t(LanguageKeys.Commands.Management.NickCleared);
		return sendTemporaryMessage(message, content);
	}
}
