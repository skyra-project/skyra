import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ZeroWidthSpace } from '@utils/constants';
import { MessageEmbed, Permissions, PermissionString, User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

const PERMISSION_FLAGS = Object.keys(Permissions.FLAGS) as PermissionString[];

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get(LanguageKeys.Commands.Moderation.PermissionsDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Moderation.PermissionsExtended),
			permissionLevel: PermissionLevels.Administrator,
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '[member:username]'
		});
	}

	public async run(message: KlasaMessage, [user = message.author]: [User]) {
		if (!user) throw message.language.get(LanguageKeys.Misc.UserNotExistent);
		const member = await message.guild!.members.fetch(user.id).catch(() => {
			throw message.language.get(LanguageKeys.Misc.UserNotInGuild);
		});

		const { permissions } = member;
		const list = [ZeroWidthSpace];
		if (permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			list.push(message.language.get(LanguageKeys.Commands.Moderation.PermissionsAll));
		} else {
			for (const flag of PERMISSION_FLAGS) {
				list.push(`${permissions.has(flag) ? '🔹' : '🔸'} ${message.language.PERMISSIONS[flag] || flag}`);
			}
		}

		const embed = new MessageEmbed()
			.setColor(await DbSet.fetchColor(message))
			.setTitle(message.language.get(LanguageKeys.Commands.Moderation.Permissions, { username: user.tag, id: user.id }))
			.setDescription(list.join('\n'));

		return message.sendMessage({ embed });
	}
}
