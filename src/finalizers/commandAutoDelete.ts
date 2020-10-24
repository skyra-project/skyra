import { Finalizer, KlasaMessage } from 'klasa';

export default class extends Finalizer {
	public async run(message: KlasaMessage) {
		if (!message.guild) return;

		const commandAutodelete = await message.guild.readSettings((guild) => guild.commandAutodelete);
		const commandAutodeleteEntry = commandAutodelete.find(([id]) => id === message.channel.id);
		if (commandAutodeleteEntry && message.deletable) {
			await message.nuke(commandAutodeleteEntry[1]);
		}
	}
}
