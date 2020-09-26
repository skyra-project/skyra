import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['togglemdm', 'togglemoddm', 'tmdm'],
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Moderation.ToggleModerationDmDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Moderation.ToggleModerationDmExtended)
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage) {
		const { users } = await DbSet.connect();
		const updated = await users.lock([message.author.id], async (id) => {
			const user = await users.ensure(id);

			user.moderationDM = !user.moderationDM;
			return user.save();
		});

		return message.sendLocale(
			updated.moderationDM
				? LanguageKeys.Commands.Moderation.ToggleModerationDmToggledEnabled
				: LanguageKeys.Commands.Moderation.ToggleModerationDmToggledDisabled
		);
	}
}
