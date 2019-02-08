import { MessageEmbed, Role } from 'discord.js';
import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { getColor } from '../../../lib/util/util';

const SORT = (x: Role, y: Role) => +(y.position > x.position) || +(x.position === y.position) - 1;

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['serverinfo'],
			cooldown: 15,
			description: (language) => language.get('COMMAND_GUILDINFO_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_GUILDINFO_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text']
		});
	}

	public async run(message: KlasaMessage) {
		let tChannels = 0, vChannels = 0, cChannels = 0;
		for (const channel of message.guild.channels.values()) {
			if (channel.type === 'text') tChannels++;
			else if (channel.type === 'voice') vChannels++;
			else cChannels++;
		}

		const serverInfoTitles = message.language.get('COMMAND_SERVERINFO_TITLES') as unknown as ServerInfoTitles;
		const roles = [...message.guild.roles.values()].sort(SORT);
		roles.pop();
		const owner = await this.client.users.fetch(message.guild.ownerID);
		return message.sendEmbed(new MessageEmbed()
			.setColor(getColor(message) || 0xFFAB2D)
			.setThumbnail(message.guild.iconURL())
			.setTitle(`${message.guild.name} [${message.guild.id}]`)
			.splitFields(message.language.get('COMMAND_SERVERINFO_ROLES', !roles.length
				? message.language.get('COMMAND_SERVERINFO_NOROLES')
				: roles.map((role) => role.name).join(', ')))
			.addField(serverInfoTitles.CHANNELS, message.language.get('COMMAND_SERVERINFO_CHANNELS',
				tChannels, vChannels, cChannels, message.guild.afkChannelID, message.guild.afkTimeout), true)
			.addField(serverInfoTitles.MEMBERS, message.language.get('COMMAND_SERVERINFO_MEMBERS',
				message.guild.memberCount, owner), true)
			.addField(serverInfoTitles.OTHER, message.language.get('COMMAND_SERVERINFO_OTHER',
				message.guild.roles.size, message.guild.region, message.guild.createdAt, message.guild.verificationLevel), true));
	}

}

interface ServerInfoTitles {
	CHANNELS: string;
	MEMBERS: string;
	OTHER: string;
}
