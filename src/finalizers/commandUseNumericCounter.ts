import { Finalizer, KlasaMessage } from 'klasa';

export default class extends Finalizer {
	public async run(message: KlasaMessage) {
		if (message.guild) await message.guild.writeSettings((guild) => ++guild.commandUses);
	}
}
