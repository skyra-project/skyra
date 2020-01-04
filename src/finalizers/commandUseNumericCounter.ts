import { ClientSettings } from '@lib/types/settings/ClientSettings';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { UserSettings } from '@lib/types/settings/UserSettings';
import { Finalizer, KlasaMessage } from 'klasa';

export default class extends Finalizer {

	public async run(message: KlasaMessage) {
		await this.client.settings!.increase(ClientSettings.CommandUses, 1);
		await message.author.settings.increase(UserSettings.CommandUses, 1);
		if (message.guild) await message.guild.settings.increase(GuildSettings.CommandUses, 1);
	}

}
