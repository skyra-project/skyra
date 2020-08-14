import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { Finalizer, KlasaMessage } from 'klasa';

export default class extends Finalizer {
	public async run(message: KlasaMessage) {
		if (!message.guild) return;

		const commandAutodelete = message.guild.settings.get(GuildSettings.CommandAutodelete);
		const commandAutodeleteEntry = commandAutodelete.find(([id]) => id === message.channel.id);
		if (commandAutodeleteEntry && message.deletable) {
			await message.nuke(commandAutodeleteEntry[1]);
		}
	}
}
