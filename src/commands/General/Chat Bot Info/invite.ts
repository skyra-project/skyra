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
			return message.sendEmbed(await this.getEmbed(message, { permissions: false }));
		}

		return message.sendEmbed(await this.getEmbed(message, { permissions: true }));
	}

	public async init() {
		if (this.client.application && !this.client.application.botPublic) this.permissionLevel = PermissionLevels.BotOwner;
	}

	private async getEmbed(message: KlasaMessage, { permissions }: { permissions: boolean }): Promise<MessageEmbed> {
		const language = await message.fetchLanguage();

		return new MessageEmbed() //
			.setColor(BrandingColors.Primary)
			.setDescription(
				[
					[
						`[${language.get(LanguageKeys.Commands.General.InvitePermissionInviteText)}](https://invite.skyra.pw${
							permissions ? '' : '/no-permissions'
						})`,
						`[${language.get(LanguageKeys.Commands.General.InvitePermissionSupportServerText)}](https://join.skyra.pw)`
					].join(' | '),
					permissions ? language.get(LanguageKeys.Commands.General.InvitePermissionsDescription) : undefined
				]
					.filter(Boolean)
					.join('\n')
			);
	}
}
