import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['togglemdm', 'togglemoddm', 'tmdm'],
	description: LanguageKeys.Commands.Moderation.ToggleModerationDmDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.ToggleModerationDmExtended
})
export class UserCommand extends SkyraCommand {
	public override async messageRun(message: GuildMessage, args: SkyraCommand.Args) {
		const enabled = await this.container.prisma.user.toggleModerationDirectMessageEnabled(message.author.id);
		const content = args.t(
			enabled
				? LanguageKeys.Commands.Moderation.ToggleModerationDmToggledEnabled
				: LanguageKeys.Commands.Moderation.ToggleModerationDmToggledDisabled
		);
		return send(message, content);
	}
}
