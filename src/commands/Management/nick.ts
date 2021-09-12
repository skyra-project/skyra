import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { seconds } from '#utils/common';
import { sendTemporaryMessage } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { PermissionFlagsBits } from 'discord-api-types/v9';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['nickname'],
	cooldownDelay: seconds(30),
	description: LanguageKeys.Commands.Management.NickDescription,
	extendedHelp: LanguageKeys.Commands.Management.NickExtended,
	permissionLevel: PermissionLevels.Moderator,
	requiredClientPermissions: [PermissionFlagsBits.ChangeNickname],
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
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
