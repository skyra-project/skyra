import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { seconds } from '#utils/common';
import { ZeroWidthSpace } from '#utils/constants';
import { getColor, getTag } from '#utils/util';
import { TimestampStyles, time } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { isCategoryChannel, isNewsChannel, isStageChannel, isTextChannel, isVoiceChannel } from '@sapphire/discord.js-utilities';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { chunk } from '@sapphire/utilities';
import { EmbedBuilder, PermissionFlagsBits, type Role } from 'discord.js';

const SORT = (x: Role, y: Role) => Number(y.position > x.position) || Number(x.position === y.position) - 1;
const roleMention = (role: Role): string => role.toString();
const roleLimit = 15;

const paginatedMessagePermissions = PermissionFlagsBits.AddReactions | PermissionFlagsBits.ManageMessages;

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['server-info'],
	description: LanguageKeys.Commands.Management.GuildInfoDescription,
	detailedDescription: LanguageKeys.Commands.Management.GuildInfoExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraCommand {
	public override async messageRun(message: GuildMessage, args: SkyraCommand.Args) {
		const color = getColor(message);
		const roles = this.getRoles(args);

		if (message.channel.permissionsFor(message.guild.members.me!)!.has(paginatedMessagePermissions)) {
			const display = await this.buildDisplay(args, roles, color);
			return display.run(message);
		}

		const embed = await this.getSummary(args, roles, color);
		return send(message, { embeds: [embed] });
	}

	private async buildDisplay(args: SkyraCommand.Args, roles: Role[], color: number): Promise<SkyraPaginatedMessage> {
		const guild = args.message.guild!;
		const display = new SkyraPaginatedMessage({
			template: new EmbedBuilder() //
				.setColor(color)
				.setThumbnail(guild.iconURL({ size: 256, extension: 'png' })!)
				.setTitle(`${guild.name} [${guild.id}]`)
		});

		display.addPageEmbed(await this.getSummary(args, roles, color));
		if (guild.icon) display.addPageEmbed(this.getIcon(args, color));
		if (guild.banner) display.addPageEmbed(this.getBanner(args, color));
		if (guild.splash) display.addPageEmbed(this.getSplash(args, color));
		if (guild.discoverySplash) display.addPageEmbed(this.getDiscoverySplash(args, color));

		if (roles.length > roleLimit) {
			for (const batch of chunk(roles, 20)) {
				if (batch.length <= 10) {
					display.addPageEmbed((embed) => embed.addFields({ name: ZeroWidthSpace, value: batch.map(roleMention).join('\n') }));
				} else {
					const left = batch.slice(0, 10);
					const right = batch.slice(10);
					display.addPageEmbed((embed) =>
						embed.addFields(
							{ name: ZeroWidthSpace, value: left.map(roleMention).join('\n'), inline: true },
							{ name: ZeroWidthSpace, value: right.map(roleMention).join('\n'), inline: true }
						)
					);
				}
			}
		}

		return display;
	}

	private async getSummary(args: SkyraCommand.Args, roles: Role[], color: number): Promise<EmbedBuilder> {
		const guild = args.message.guild!;

		const serverInfoTitles = args.t(LanguageKeys.Commands.Management.GuildInfoTitles);
		const roleCount = guild.roles.cache.size - 1;
		return new EmbedBuilder()
			.setColor(color)
			.setThumbnail(guild.iconURL({ size: 256, extension: 'png' })!)
			.setTitle(`${guild.name} [${guild.id}]`)
			.addFields(
				{ name: args.t(LanguageKeys.Commands.Whois.RolesTitle, { count: roleCount }), value: this.getSummaryRoles(args, roles) },
				{ name: serverInfoTitles.MEMBERS, value: await this.getSummaryMembers(args), inline: true },
				{ name: serverInfoTitles.CHANNELS, value: this.getSummaryChannels(args), inline: true },
				{ name: serverInfoTitles.OTHER, value: this.getSummaryOther(args) }
			);
	}

	private getBanner(args: SkyraCommand.Args, color: number): EmbedBuilder {
		const guild = args.message.guild!;
		return this.getImage(args.t(LanguageKeys.Commands.Management.GuildInfoBanner), guild.bannerURL({ size: 4096, extension: 'png' })!, color);
	}

	private getIcon(args: SkyraCommand.Args, color: number): EmbedBuilder {
		const guild = args.message.guild!;
		return this.getImage(args.t(LanguageKeys.Commands.Management.GuildInfoIcon), guild.iconURL({ size: 4096, extension: 'png' })!, color);
	}

	private getSplash(args: SkyraCommand.Args, color: number): EmbedBuilder {
		const guild = args.message.guild!;
		return this.getImage(args.t(LanguageKeys.Commands.Management.GuildInfoSplash), guild.splashURL({ size: 4096, extension: 'png' })!, color);
	}

	private getDiscoverySplash(args: SkyraCommand.Args, color: number): EmbedBuilder {
		const guild = args.message.guild!;
		return this.getImage(
			args.t(LanguageKeys.Commands.Management.GuildInfoDiscoverySplash),
			guild.discoverySplashURL({ size: 4096, extension: 'png' })!,
			color
		);
	}

	private getImage(description: string, url: string, color: number): EmbedBuilder {
		return new EmbedBuilder().setColor(color).setDescription(`${description} [→](${url})`).setImage(url).setThumbnail(null!);
	}

	private getRoles(args: SkyraCommand.Args): Role[] {
		const roles = [...args.message.guild!.roles.cache.values()].sort(SORT);
		// Pop off the @everyone role
		roles.pop();

		return roles;
	}

	private getSummaryRoles(args: SkyraCommand.Args, roles: Role[]): string {
		if (roles.length <= roleLimit) return args.t(LanguageKeys.Globals.AndListValue, { value: roles.map(roleMention) });

		const mentions = roles
			.slice(0, roleLimit - 1)
			.map(roleMention)
			.concat(args.t(LanguageKeys.Commands.Tools.WhoisMemberRoleListAndMore, { count: roles.length - roleLimit - 1 }));
		return args.t(LanguageKeys.Globals.AndListValue, { value: mentions });
	}

	private async getSummaryMembers(args: SkyraCommand.Args): Promise<string> {
		const guild = args.message.guild!;
		const owner = await this.container.client.users.fetch(guild.ownerId);

		return args.t(LanguageKeys.Commands.Management.GuildInfoMembers, {
			memberCount: guild.memberCount,
			ownerId: owner.id,
			ownerTag: getTag(owner)
		});
	}

	private getSummaryChannels(args: SkyraCommand.Args): string {
		const guild = args.message.guild!;

		let tChannels = 0;
		let vChannels = 0;
		let cChannels = 0;
		for (const channel of guild.channels.cache.values()) {
			if (isTextChannel(channel) || isNewsChannel(channel)) tChannels++;
			else if (isVoiceChannel(channel) || isStageChannel(channel)) vChannels++;
			else if (isCategoryChannel(channel)) cChannels++;
		}

		return args.t(LanguageKeys.Commands.Management.GuildInfoChannels, {
			text: tChannels,
			voice: vChannels,
			categories: cChannels,
			afkChannelText: guild.afkChannelId
				? args.t(LanguageKeys.Commands.Management.GuildInfoChannelsAfkChannelText, {
						afkChannel: guild.afkChannelId,
						afkTime: guild.afkTimeout / 60
					})
				: `**${args.t(LanguageKeys.Globals.None)}**`
		});
	}

	private getSummaryOther(args: SkyraCommand.Args): string {
		const guild = args.message.guild!;
		return args.t(LanguageKeys.Commands.Management.GuildInfoOther, {
			size: guild.roles.cache.size,
			createdAt: time(seconds.fromMilliseconds(guild.createdTimestamp), TimestampStyles.ShortDateTime),
			verificationLevel: guild.verificationLevel
		});
	}
}
