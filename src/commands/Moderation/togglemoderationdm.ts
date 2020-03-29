import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { UserSettings } from '@lib/types/settings/UserSettings';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['togglemdm', 'togglemoddm', 'tmdm'],
	cooldown: 10,
	description: language => language.tget('COMMAND_TOGGLEMODERATIONDM_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_TOGGLEMODERATIONDM_EXTENDED')
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage) {
		await message.author.settings.sync();
		const current = message.author.settings.get(UserSettings.ModerationDM);
		await message.author.settings.update(UserSettings.ModerationDM, !current, {
			extraContext: { author: message.author.id }
		});
		return message.sendLocale('COMMAND_TOGGLEMODERATIONDM_TOGGLED', [!current]);
	}

}
