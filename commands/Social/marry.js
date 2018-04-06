const { Command } = require('klasa');
const REGEXP_ACCEPT = /^(y|ye|yea|yeah|yes)$/i;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			cooldown: 30,
			description: msg => msg.language.get('COMMAND_MARRY_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_MARRY_EXTENDED'),
			usage: '<user:username>'
		});
	}

	async run(msg, [user]) {
		if (msg.author.id === user.id) msg.sendMessage(msg.language.get('COMMAND_MARRY_SELF'));

		// Configuration is already sync by the monitors.
		if (msg.author.configs.marry) msg.sendMessage(msg.language.get('COMMAND_MARRY_AUTHOR_TAKEN'));

		// Check if the target user is already married.
		if (user.configs._syncStatus) await user.configs._syncStatus;
		if (user.configs.marry) msg.sendMessage(msg.language.get('COMMAND_MARRY_TAKEN'));

		// Get a message from the user.
		await msg.sendMessage(msg.language.get('COMMAND_MARRY_PETITION', msg.author, user));
		const messages = await msg.channel.awaitMessages(message => message.author.id === user.id, { time: 60000, max: 1 });
		if (!messages.size) msg.sendMessage(msg.language.get('COMMAND_MARRY_NOREPLY'));

		const message = messages.first();
		if (!REGEXP_ACCEPT.test(message.content)) throw msg.language.get('COMMAND_MARRY_DENIED');

		// The user may have tried to marry somebody else while the prompt was running.
		if (user.configs.marry) msg.sendMessage(msg.language.get('COMMAND_MARRY_TAKEN'));
		if (msg.author.configs.marry) msg.sendMessage(msg.language.get('COMMAND_MARRY_AUTHOR_TAKEN'));

		await Promise.all([
			msg.author.configs.update('marry', user),
			user.configs.update('marry', msg.author)
		]);

		return msg.send(msg.language.get('COMMAND_MARRY_ACCEPTED', msg.author, user));
	}

};
