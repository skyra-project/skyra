import { Event, KlasaMessage } from 'klasa';

export default class extends Event {

	public async run(message: KlasaMessage): Promise<void> {
		if (message.system || message.webhookID) return;

		if (this.client.ready) {
			if (message.guild && !message.member) await message.guild.members.fetch(message.author.id);
			// tslint:disable-next-line:no-floating-promises
			this.client.monitors.run(message);
		}
	}

}
