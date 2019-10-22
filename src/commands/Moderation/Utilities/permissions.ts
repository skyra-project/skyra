import { MessageEmbed, Permissions, PermissionString } from 'discord.js';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { getColor } from '../../../lib/util/util';

const PERMISSION_FLAGS = Object.keys(Permissions.FLAGS) as PermissionString[];

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: 'Check the permission for a member, or yours.',
			permissionLevel: 6,
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '[member:username]'
		});
	}

	public async run(message: KlasaMessage, [user = message.author]: [KlasaUser]) {
		if (!user) throw message.language.tget('USER_NOT_EXISTENT');
		const member = await message.guild!.members.fetch(user.id).catch(() => {
			throw message.language.tget('USER_NOT_IN_GUILD');
		});

		const { permissions } = member;
		const list = ['\u200B'];
		if (permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			list.push(message.language.tget('COMMAND_PERMISSIONS_ALL'));
		} else {
			for (const flag of PERMISSION_FLAGS) {
				list.push(`${permissions.has(flag) ? '🔹' : '🔸'} ${message.language.PERMISSIONS[flag] || flag}`);
			}
		}

		const embed = new MessageEmbed()
			.setColor(getColor(message) || 0xFFAB2D)
			.setTitle(message.language.tget('COMMAND_PERMISSIONS', user.tag, user.id))
			.setDescription(list.join('\n'));

		return message.sendMessage({ embed });
	}

}
