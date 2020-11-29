import { DbSet } from '#lib/database';
import { SkyraEmbed } from '#lib/discord';
import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { GuildMessage } from '#lib/types';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { cast } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { Role } from 'discord.js';
import { CommandOptions } from 'klasa';

const SORT = (x: Role, y: Role) => Number(y.position > x.position) || Number(x.position === y.position) - 1;

@ApplyOptions<CommandOptions>({
	aliases: ['serverinfo'],
	cooldown: 15,
	description: (language) => language.get(LanguageKeys.Commands.Management.GuildInfoDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.GuildInfoExtended),
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text']
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage) {
		let tChannels = 0;
		let vChannels = 0;
		let cChannels = 0;
		for (const channel of message.guild.channels.cache.values()) {
			if (channel.type === 'text' || channel.type === 'news') tChannels++;
			else if (channel.type === 'voice') vChannels++;
			else if (channel.type === 'category') cChannels++;
		}

		const language = await message.fetchLanguage();
		const serverInfoTitles = cast<ServerInfoTitles>(language.get(LanguageKeys.Commands.Management.GuildInfoTitles));
		const roles = [...message.guild.roles.cache.values()].sort(SORT);
		roles.pop();
		const owner = await this.client.users.fetch(message.guild.ownerID);
		return message.send(
			new SkyraEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setThumbnail(message.guild.iconURL()!)
				.setTitle(`${message.guild.name} [${message.guild.id}]`)
				.splitFields(
					language.get(
						roles.length === 1 ? LanguageKeys.Commands.Tools.WhoisMemberRoles : LanguageKeys.Commands.Tools.WhoisMemberRolesPlural,
						{ count: roles.length }
					),
					roles.join(' ')
				)
				.addField(
					serverInfoTitles.CHANNELS,
					language.get(LanguageKeys.Commands.Management.GuildInfoChannels, {
						text: tChannels,
						voice: vChannels,
						categories: cChannels,
						afkChannelText: message.guild.afkChannelID
							? language.get(LanguageKeys.Commands.Management.GuildInfoChannelsAfkChannelText, {
									afkChannel: message.guild.afkChannelID,
									afkTime: message.guild.afkTimeout
							  })
							: `**${language.get(LanguageKeys.Globals.None)}**`
					}),
					true
				)
				.addField(
					serverInfoTitles.MEMBERS,
					language.get(LanguageKeys.Commands.Management.GuildInfoMembers, {
						count: message.guild.memberCount.toLocaleString(language.name),
						owner
					}),
					true
				)
				.addField(
					serverInfoTitles.OTHER,
					language.get(LanguageKeys.Commands.Management.GuildInfoOther, {
						size: message.guild.roles.cache.size,
						region: message.guild.region,
						createdAt: message.guild.createdTimestamp,
						verificationLevel: message.guild.verificationLevel
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
