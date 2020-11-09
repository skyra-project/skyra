import { DbSet } from '@lib/database';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { GuildMessage } from '@lib/types';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { ZeroWidthSpace } from '@utils/constants';
import { MessageEmbed, Permissions, PermissionString, User } from 'discord.js';

const PERMISSION_FLAGS = Object.keys(Permissions.FLAGS) as PermissionString[];

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Moderation.PermissionsDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Moderation.PermissionsExtended),
	permissionLevel: PermissionLevels.Administrator,
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	usage: '[member:username]'
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage, [user = message.author]: [User]) {
		const language = await message.fetchLanguage();

		if (!user) throw language.get(LanguageKeys.Misc.UserNotExistent);
		const member = await message.guild!.members.fetch(user.id).catch(() => {
			throw language.get(LanguageKeys.Misc.UserNotInGuild);
		});

		const { permissions } = member;
		const list = [ZeroWidthSpace];

		if (permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			list.push(language.get(LanguageKeys.Commands.Moderation.PermissionsAll));
		} else {
			for (const flag of PERMISSION_FLAGS) {
				list.push(`${permissions.has(flag) ? '🔹' : '🔸'} ${language.PERMISSIONS[flag] || flag}`);
			}
		}

		const embed = new MessageEmbed()
			.setColor(await DbSet.fetchColor(message))
			.setTitle(language.get(LanguageKeys.Commands.Moderation.Permissions, { username: user.tag, id: user.id }))
			.setDescription(list.join('\n'));

		return message.sendMessage({ embed });
	}
}
