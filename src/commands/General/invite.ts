import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { BrandingColors } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
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
		return new MessageEmbed() //
			.setColor(BrandingColors.Primary)
			.setDescription(
				[
					[
						`[${t(LanguageKeys.Commands.General.InvitePermissionInviteText)}](https://invite.skyra.pw${
							shouldNotAddPermissions ? '/no-permissions' : ''
						})`,
						`[${t(LanguageKeys.Commands.General.InvitePermissionSupportServerText)}](https://join.skyra.pw)`
					].join(' | '),
					shouldNotAddPermissions ? undefined : t(LanguageKeys.Commands.General.InvitePermissionsDescription)
				]
					.filter(Boolean)
					.join('\n')
			);
	}
}
