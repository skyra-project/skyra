import { UserEntity } from '#lib/database';
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
		const { users } = this.container.db;
		let user = await users.findOne({ where: { id: message.author.id } });
		if (user) {
			user.moderationDM = !user.moderationDM;
		} else {
			user = new UserEntity();
			user.id = message.author.id;
			user.moderationDM = false;
		}
		await user.save();

		const content = args.t(
			user.moderationDM
				? LanguageKeys.Commands.Moderation.ToggleModerationDmToggledEnabled
				: LanguageKeys.Commands.Moderation.ToggleModerationDmToggledDisabled
		);
		return send(message, content);
	}
}
