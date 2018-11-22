import { Event } from '../index';

export default class extends Event {

	async run(msg) {
		if (msg.system || msg.webhookID) return;

		if (this.client.ready) {
			if (msg.guild && !msg.member) await msg.guild.members.fetch(msg.author.id);
			this.client.monitors.run(msg);
		}
	}

};
