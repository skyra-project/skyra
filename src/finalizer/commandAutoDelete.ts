import { Finalizer, KlasaMessage } from 'klasa';
import { GuildSettings } from '../lib/types/settings/GuildSettings';

export default class extends Finalizer {

	public async run(message: KlasaMessage) {
		const commandAutodelete = message.guild!.settings.get(GuildSettings.CommandAutodelete) as GuildSettings.CommandAutodelete;
		const commandAutodeleteEntry = commandAutodelete.find(([id]) => id === message.channel.id);
		if (commandAutodeleteEntry && message.deletable) {
			await message.nuke(commandAutodeleteEntry[1]);
		}
	}

}
