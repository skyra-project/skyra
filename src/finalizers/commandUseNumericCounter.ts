import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { Finalizer, KlasaMessage } from 'klasa';

export default class extends Finalizer {
	public async run(message: KlasaMessage) {
		if (message.guild) await message.guild.settings.increase(GuildSettings.CommandUses, 1);
	}
}
