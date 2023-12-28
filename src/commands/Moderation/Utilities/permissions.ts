import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { PermissionsBits, PermissionsBitsList } from '#utils/bits';
import { ZeroWidthSpace } from '#utils/constants';
import { getColor, getTag } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Moderation.PermissionsDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.PermissionsExtended,
	permissionLevel: PermissionLevels.Administrator,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraCommand {
	public override async messageRun(message: GuildMessage, args: SkyraCommand.Args) {
		const user = args.finished ? message.author : await args.pick('userName');
		const member = await message.guild.members.fetch(user.id).catch(() => {
			this.error(LanguageKeys.Misc.UserNotInGuild);
		});

		const permissions = member.permissions.bitfield;
		const list = [ZeroWidthSpace];

		if (PermissionsBits.has(permissions, PermissionFlagsBits.Administrator)) {
			list.push(args.t(LanguageKeys.Commands.Moderation.PermissionsAll));
		} else {
			for (const [name, flag] of PermissionsBitsList) {
				list.push(`${PermissionsBits.has(permissions, flag) ? '🔹' : '🔸'} ${args.t(`permissions:${name}`)}`);
			}
		}

		const embed = new EmbedBuilder()
			.setColor(getColor(message))
			.setTitle(args.t(LanguageKeys.Commands.Moderation.Permissions, { username: getTag(user), id: user.id }))
			.setDescription(list.join('\n'));
		return send(message, { embeds: [embed] });
	}
}
