import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['nickname'],
	cooldown: 30,
	description: LanguageKeys.Commands.Management.NickDescription,
	extendedHelp: LanguageKeys.Commands.Management.NickExtended,
	permissionLevel: PermissionLevels.Moderator,
	requiredPermissions: ['CHANGE_NICKNAME'],
	runIn: ['text'],
	usage: '[nick:string{,32}]'
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage, [nickname = '']: [string?]) {
		await message.guild.me!.setNickname(nickname);
		return nickname
			? message.alert(await message.resolveKey(LanguageKeys.Commands.Management.NickSet, { nickname }))
			: message.alert(await message.resolveKey(LanguageKeys.Commands.Management.NickCleared));
	}
}
