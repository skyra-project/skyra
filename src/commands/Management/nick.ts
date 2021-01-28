import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['nickname'],
	cooldown: 30,
	description: LanguageKeys.Commands.Management.NickDescription,
	extendedHelp: LanguageKeys.Commands.Management.NickExtended,
	permissionLevel: PermissionLevels.Moderator,
	permissions: ['CHANGE_NICKNAME'],
	runIn: ['text'],
	usage: '[nick:string{,32}]'
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, [nickname = '']: [string?]) {
		await message.guild.me!.setNickname(nickname);
		return nickname
			? message.alert(await message.resolveKey(LanguageKeys.Commands.Management.NickSet, { nickname }))
			: message.alert(await message.resolveKey(LanguageKeys.Commands.Management.NickCleared));
	}
}
