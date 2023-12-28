import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { BrandingColors } from '#utils/constants';
import { EmbedBuilder, hyperlink } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import type { TFunction } from '@sapphire/plugin-i18next';
import { OAuth2Scopes, PermissionFlagsBits, type Message } from 'discord.js';

const flags = ['noperms', 'nopermissions'];

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.General.InviteDescription,
	detailedDescription: LanguageKeys.Commands.General.InviteExtended,
	flags,
	guarded: true,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public override messageRun(message: Message, args: SkyraCommand.Args) {
		const shouldNotAddPermissions = args.nextMaybe().match({
			some: (value) => flags.includes(value.toLowerCase()),
			none: () => args.getFlags(...flags)
		});

		const embed = this.getEmbed(args.t, shouldNotAddPermissions);
		return send(message, { embeds: [embed] });
	}

	private getEmbed(t: TFunction, shouldNotAddPermissions: boolean): EmbedBuilder {
		const embeddedInviteLink = hyperlink(
			t(LanguageKeys.Commands.General.InvitePermissionInviteText),
			this.generateInviteLink(shouldNotAddPermissions)
		);
		const embeddedJoinLink = hyperlink(t(LanguageKeys.Commands.General.InvitePermissionSupportServerText), 'https://discord.com/invite/6gakFR2');

		return new EmbedBuilder() //
			.setColor(BrandingColors.Primary)
			.setDescription(
				[
					[embeddedInviteLink, embeddedJoinLink].join(' | '),
					shouldNotAddPermissions ? undefined : t(LanguageKeys.Commands.General.InvitePermissionsDescription)
				]
					.filter(Boolean)
					.join('\n')
			);
	}

	private generateInviteLink(shouldNotAddPermissions: boolean) {
		return this.container.client.generateInvite({
			scopes: [OAuth2Scopes.ApplicationsCommands, OAuth2Scopes.Bot],
			permissions: shouldNotAddPermissions
				? 0n
				: PermissionFlagsBits.AddReactions |
					PermissionFlagsBits.AttachFiles |
					PermissionFlagsBits.BanMembers |
					PermissionFlagsBits.ChangeNickname |
					PermissionFlagsBits.CreatePrivateThreads |
					PermissionFlagsBits.CreatePublicThreads |
					PermissionFlagsBits.DeafenMembers |
					PermissionFlagsBits.EmbedLinks |
					PermissionFlagsBits.KickMembers |
					PermissionFlagsBits.ManageChannels |
					PermissionFlagsBits.ManageGuildExpressions |
					PermissionFlagsBits.ManageGuild |
					PermissionFlagsBits.ManageMessages |
					PermissionFlagsBits.ManageNicknames |
					PermissionFlagsBits.ManageRoles |
					PermissionFlagsBits.ManageThreads |
					PermissionFlagsBits.MoveMembers |
					PermissionFlagsBits.MuteMembers |
					PermissionFlagsBits.ReadMessageHistory |
					PermissionFlagsBits.SendMessages |
					PermissionFlagsBits.SendMessagesInThreads |
					PermissionFlagsBits.UseExternalEmojis |
					PermissionFlagsBits.UseExternalStickers |
					PermissionFlagsBits.ViewChannel
		});
	}
}
