import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.General.InviteDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.General.InviteExtended),
	usage: '[noperms]',
	flagSupport: true,
	guarded: true,
	requiredPermissions: ['EMBED_LINKS']
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [noperms]: ['noperms' | undefined]) {
		if (noperms === 'noperms' || Reflect.has(message.flagArgs, 'nopermissions')) {
			return message.sendEmbed(this.getEmbed(message, { permissions: false }));
		}

		return message.sendEmbed(this.getEmbed(message, { permissions: true }));
	}

	public async init() {
		if (this.client.application && !this.client.application.botPublic) this.permissionLevel = PermissionLevels.BotOwner;
	}

	private getEmbed(message: KlasaMessage, { permissions }: { permissions: boolean }): MessageEmbed {
		return new MessageEmbed() //
			.setColor(BrandingColors.Primary)
			.setDescription(
				[
					[
						`[${message.language.get(LanguageKeys.Commands.General.InvitePermissionInviteText)}](https://invite.skyra.pw${
							permissions ? '' : '/no-permissions'
						})`,
						`[${message.language.get(LanguageKeys.Commands.General.InvitePermissionSupportServerText)}](https://join.skyra.pw)`
					].join(' | '),
					permissions ? message.language.get(LanguageKeys.Commands.General.InvitePermissionsDescription) : undefined
				]
					.filter(Boolean)
					.join('\n')
			);
	}
}
