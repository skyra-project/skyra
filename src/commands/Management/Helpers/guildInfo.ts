import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { MessageEmbed, Role } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

const SORT = (x: Role, y: Role) => Number(y.position > x.position) || Number(x.position === y.position) - 1;

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['serverinfo'],
			cooldown: 15,
			description: (language) => language.get('commandGuildInfoDescription'),
			extendedHelp: (language) => language.get('commandGuildInfoExtended'),
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text']
		});
	}

	public async run(message: KlasaMessage) {
		let tChannels = 0;
		let vChannels = 0;
		let cChannels = 0;
		for (const channel of message.guild!.channels.cache.values()) {
			if (channel.type === 'text') tChannels++;
			else if (channel.type === 'voice') vChannels++;
			else cChannels++;
		}

		const serverInfoTitles = (message.language.get('commandGuildInfoTitles') as unknown) as ServerInfoTitles;
		const roles = [...message.guild!.roles.cache.values()].sort(SORT);
		roles.pop();
		const owner = await this.client.users.fetch(message.guild!.ownerID);
		return message.sendEmbed(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setThumbnail(message.guild!.iconURL()!)
				.setTitle(`${message.guild!.name} [${message.guild!.id}]`)
				.splitFields(
					message.language.get(roles.length === 1 ? 'commandWhoisMemberRoles' : 'commandWhoisMemberRolesPlural', { count: roles.length }),
					roles.join(' ')
				)
				.addField(
					serverInfoTitles.CHANNELS,
					message.language.get('commandGuildInfoChannels', {
						text: tChannels,
						voice: vChannels,
						categories: cChannels,
						afkChannelText: message.guild!.afkChannelID
							? message.language.get('commandGuildInfoChannelsAfkChannelText', {
									afkChannel: message.guild!.afkChannelID,
									afkTime: message.guild!.afkTimeout
							  })
							: `**${message.language.get('globalNone')}**`
					}),
					true
				)
				.addField(
					serverInfoTitles.MEMBERS,
					message.language.get('commandGuildInfoMembers', {
						count: message.guild!.memberCount.toLocaleString(message.language.name),
						owner
					}),
					true
				)
				.addField(
					serverInfoTitles.OTHER,
					message.language.get('commandGuildInfoOther', {
						size: message.guild!.roles.cache.size,
						region: message.guild!.region,
						createdAt: message.guild!.createdTimestamp,
						verificationLevel: message.guild!.verificationLevel
					}),
					true
				)
		);
	}
}

interface ServerInfoTitles {
	CHANNELS: string;
	MEMBERS: string;
	OTHER: string;
}
