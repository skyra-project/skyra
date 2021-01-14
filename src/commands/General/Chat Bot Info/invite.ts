import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { BrandingColors } from '#utils/constants';
import { ApplyOptions } from '@skyra/decorators';
import { Message, MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 10,
	description: LanguageKeys.Commands.General.InviteDescription,
	extendedHelp: LanguageKeys.Commands.General.InviteExtended,
	usage: '[noperms]',
	flagSupport: true,
	guarded: true,
	requiredPermissions: ['EMBED_LINKS']
})
export default class extends SkyraCommand {
	public async run(message: Message, [noperms]: ['noperms' | undefined]) {
		const t = await message.fetchT();
		if (noperms === 'noperms' || Reflect.has(message.flagArgs, 'nopermissions')) {
			return message.send(this.getEmbed(t, { permissions: false }));
		}

		return message.send(this.getEmbed(t, { permissions: true }));
	}

	public async init() {
		if (this.client.application && !this.client.application.botPublic) this.permissionLevel = PermissionLevels.BotOwner;
	}

	private getEmbed(t: TFunction, { permissions }: { permissions: boolean }): MessageEmbed {
		return new MessageEmbed() //
			.setColor(BrandingColors.Primary)
			.setDescription(
				[
					[
						`[${t(LanguageKeys.Commands.General.InvitePermissionInviteText)}](https://invite.skyra.pw${
							permissions ? '' : '/no-permissions'
						})`,
						`[${t(LanguageKeys.Commands.General.InvitePermissionSupportServerText)}](https://join.skyra.pw)`
					].join(' | '),
					permissions ? t(LanguageKeys.Commands.General.InvitePermissionsDescription) : undefined
				]
					.filter(Boolean)
					.join('\n')
			);
	}
}
