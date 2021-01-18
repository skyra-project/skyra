import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ZeroWidthSpace } from '#utils/constants';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed, Permissions, PermissionString, User } from 'discord.js';

const PERMISSION_FLAGS = Object.keys(Permissions.FLAGS) as PermissionString[];

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Moderation.PermissionsDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.PermissionsExtended,
	permissionLevel: PermissionLevels.Administrator,
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	usage: '[member:username]'
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage, [user = message.author]: [User]) {
		const t = await message.fetchT();

		if (!user) throw t(LanguageKeys.Misc.UserNotExistent);
		const member = await message.guild.members.fetch(user.id).catch(() => {
			throw t(LanguageKeys.Misc.UserNotInGuild);
		});

		const { permissions } = member;
		const list = [ZeroWidthSpace];

		if (permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			list.push(t(LanguageKeys.Commands.Moderation.PermissionsAll));
		} else {
			for (const flag of PERMISSION_FLAGS) {
				list.push(`${permissions.has(flag) ? '🔹' : '🔸'} ${t(`permissions:${flag}`, flag)}`);
			}
		}

		return message.send(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setTitle(t(LanguageKeys.Commands.Moderation.Permissions, { username: user.tag, id: user.id }))
				.setDescription(list.join('\n'))
		);
	}
}
