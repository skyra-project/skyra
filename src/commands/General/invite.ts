import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { BrandingColors } from '#utils/constants';
import { hyperlink } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { OAuth2Scopes, PermissionFlagsBits } from 'discord-api-types/v9';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

const flags = ['noperms', 'nopermissions'];

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.General.InviteDescription,
	detailedDescription: LanguageKeys.Commands.General.InviteExtended,
	flags,
	guarded: true,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public messageRun(message: Message, args: SkyraCommand.Args) {
		const arg = args.nextMaybe();
		const shouldNotAddPermissions = arg.exists ? flags.includes(arg.value.toLowerCase()) : args.getFlags(...flags);

		const embed = this.getEmbed(args.t, shouldNotAddPermissions);
		return send(message, { embeds: [embed] });
	}

	private getEmbed(t: TFunction, shouldNotAddPermissions: boolean): MessageEmbed {
		const embeddedInviteLink = hyperlink(
			t(LanguageKeys.Commands.General.InvitePermissionInviteText),
			this.generateInviteLink(shouldNotAddPermissions)
		);
		const embeddedJoinLink = hyperlink(t(LanguageKeys.Commands.General.InvitePermissionSupportServerText), 'https://discord.com/invite/6gakFR2');

		return new MessageEmbed() //
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
				  PermissionFlagsBits.ManageEmojisAndStickers |
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
