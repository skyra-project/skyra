const { Command } = require('../../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			bucket: 2,
			cooldown: 15,
			description: 'Check the messages/minute from a channel.',
			permissionLevel: 4,
			runIn: ['text'],
			usage: '[channel:channelname]'
		});
	}

	async run(msg, [channel = msg.channel]) {
		if (!channel.readable) throw msg.language.get('CHANNEL_NOT_READABLE');
		const messages = await channel.messages.fetch({ limit: 100, before: msg.id }),
			minimum = msg.createdTimestamp - 60000,
			amount = messages.reduce((prev, curr) => curr.createdTimestamp > minimum ? prev + 1 : prev, 0);

		return msg.sendMessage(msg.language.get('COMMAND_FLOW', amount));
	}

};
