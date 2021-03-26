import { SkyraEmbed } from '#lib/discord';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import type { Role } from 'discord.js';

const SORT = (x: Role, y: Role) => Number(y.position > x.position) || Number(x.position === y.position) - 1;

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['serverinfo'],
	cooldown: 15,
	description: LanguageKeys.Commands.Management.GuildInfoDescription,
	extendedHelp: LanguageKeys.Commands.Management.GuildInfoExtended,
	permissions: ['EMBED_LINKS'],
	runIn: ['text']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const serverInfoTitles = args.t(LanguageKeys.Commands.Management.GuildInfoTitles);
		const roleCount = message.guild.roles.cache.size - 1;

		return message.send(
			new SkyraEmbed()
				.setColor(await this.context.db.fetchColor(message))
				.setThumbnail(message.guild.iconURL()!)
				.setTitle(`${message.guild.name} [${message.guild.id}]`)
				.addField(args.t(LanguageKeys.Commands.Tools.WhoisMemberRoles, { count: roleCount }), this.getRoles(args))
				.addField(serverInfoTitles.MEMBERS, await this.getMembers(args), true)
				.addField(serverInfoTitles.CHANNELS, this.getChannels(args), true)
				.addField(serverInfoTitles.OTHER, this.getOther(args))
		);
	}

	private getRoles(args: SkyraCommand.Args): string {
		const guild = args.message.guild!;
		const roles = [...guild.roles.cache.values()].sort(SORT);
		// Pop off the @everyone role
		roles.pop();

		if (roles.length <= 15) return args.t(LanguageKeys.Globals.AndListValue, { value: roles.map((role) => role.toString()) });

		const mentions = roles
			.slice(0, 14)
			.map((role) => role.toString())
			.concat(args.t(LanguageKeys.Commands.Tools.WhoisMemberRoleListAndMore, { count: roles.length - 14 }));
		return args.t(LanguageKeys.Globals.AndListValue, { value: mentions });
	}

	private async getMembers(args: SkyraCommand.Args): Promise<string> {
		const guild = args.message.guild!;
		const owner = await this.context.client.users.fetch(guild.ownerID);

		return args.t(LanguageKeys.Commands.Management.GuildInfoMembers, { memberCount: guild.memberCount, owner });
	}

	private getChannels(args: SkyraCommand.Args): string {
		const guild = args.message.guild!;

		let tChannels = 0;
		let vChannels = 0;
		let cChannels = 0;
		for (const channel of guild.channels.cache.values()) {
			if (channel.type === 'text' || channel.type === 'news') tChannels++;
			else if (channel.type === 'voice') vChannels++;
			else if (channel.type === 'category') cChannels++;
		}

		return args.t(LanguageKeys.Commands.Management.GuildInfoChannels, {
			text: tChannels,
			voice: vChannels,
			categories: cChannels,
			afkChannelText: guild.afkChannelID
				? args.t(LanguageKeys.Commands.Management.GuildInfoChannelsAfkChannelText, {
						afkChannel: guild.afkChannelID,
						afkTime: guild.afkTimeout / 60
				  })
				: `**${args.t(LanguageKeys.Globals.None)}**`
		});
	}

	private getOther(args: SkyraCommand.Args): string {
		const guild = args.message.guild!;
		return args.t(LanguageKeys.Commands.Management.GuildInfoOther, {
			size: guild.roles.cache.size,
			region: guild.region,
			createdAt: guild.createdTimestamp,
			verificationLevel: guild.verificationLevel
		});
	}
}
