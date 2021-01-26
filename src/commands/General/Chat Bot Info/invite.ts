import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { BrandingColors } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

const flags = ['noperms', 'nopermissions'];

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 10,
	description: LanguageKeys.Commands.General.InviteDescription,
	extendedHelp: LanguageKeys.Commands.General.InviteExtended,
	guarded: true,
	permissions: ['EMBED_LINKS'],
	strategyOptions: { flags }
})
export class InviteCommand extends SkyraCommand {
	public run(message: Message, args: SkyraCommand.Args) {
		const arg = args.nextMaybe();
		const shouldNotAddPermissions = arg.exists ? flags.includes(arg.value.toLowerCase()) : args.getFlags(...flags);

		return message.send(this.getEmbed(args.t, shouldNotAddPermissions));
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
