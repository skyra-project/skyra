const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guildOnly: true,
			permLevel: 10,
			mode: 2,

			usage: '<limit:int>',
			description: 'Clear some messages from me.'
		});
	}

	async run(msg, [limit]) {
		const messages = await msg.channel.messages.fetch({ limit })
			.then(msgs => msgs.filter(mes => mes.author.id === this.client.user.id));

		for (const message of messages.values())
			await message.nuke()
				.catch(err => this.client.emit('log', err, 'error'));
	}

};
