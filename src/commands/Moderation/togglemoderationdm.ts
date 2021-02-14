import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['togglemdm', 'togglemoddm', 'tmdm'],
	cooldown: 10,
	description: LanguageKeys.Commands.Moderation.ToggleModerationDmDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.ToggleModerationDmExtended
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const { users } = await DbSet.connect();
		const updated = await users.lock([message.author.id], async (id) => {
			const user = await users.ensure(id);

			user.moderationDM = !user.moderationDM;
			return user.save();
		});

		return message.send(
			args.t(
				updated.moderationDM
					? LanguageKeys.Commands.Moderation.ToggleModerationDmToggledEnabled
					: LanguageKeys.Commands.Moderation.ToggleModerationDmToggledDisabled
			)
		);
	}
}
