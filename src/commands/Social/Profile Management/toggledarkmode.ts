import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['darkmode', 'toggledarktheme', 'darktheme'],
	cooldown: 5,
	description: LanguageKeys.Commands.Social.ToggleDarkModeDescription,
	extendedHelp: LanguageKeys.Commands.Social.ToggleDarkModeExtended
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, []: []) {
		const { users } = await DbSet.connect();
		const updated = await users.lock([message.author.id], async (id) => {
			const user = await users.ensureProfile(id);

			user.profile.darkTheme = !user.profile.darkTheme;
			return user.save();
		});

		return message.sendTranslated(
			updated.profile.darkTheme ? LanguageKeys.Commands.Social.ToggleDarkModeEnabled : LanguageKeys.Commands.Social.ToggleDarkModeDisabled
		);
	}
}
