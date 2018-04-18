const { Command } = require('klasa');

const REGEXP_ACCEPT = /^(y|ye|yea|yeah|yes)$/i;
const SNEYRA_ID = '338249781594030090';

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			cooldown: 30,
			description: msg => msg.language.get('COMMAND_MARRY_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_MARRY_EXTENDED'),
			usage: '(user:username)'
		});

		this.createCustomResolver('username', async (arg, possible, msg) => {
			if (!arg) return undefined;
			return this.client.argResolver.username(arg, possible, msg);
		});
	}

	run(msg, [user]) {
		return user ? this._marry(msg, user) : this._display(msg);
	}

	async _display(msg) {
		if (!msg.author.configs.marry) return msg.sendMessage(msg.language.get('COMMAND_MARRY_NOTTAKEN'));
		const username = await this.client.fetchUsername(msg.author.configs.marry);
		return msg.sendMessage(msg.language.get('COMMAND_MARRY_WITH', username));
	}

	async _marry(msg, user) {
		if (user.id === this.client.user.id) return msg.sendMessage(msg.language.get('COMMAND_MARRY_SKYRA'));
		if (user.id === SNEYRA_ID) return msg.sendMessage(msg.language.get('COMMAND_MARRY_SNEYRA'));
		if (user.id === msg.author.id) return msg.sendMessage(msg.language.get('COMMAND_MARRY_SELF'));
		if (user.bot) return msg.sendMessage(msg.language.get('COMMAND_MARRY_BOTS'));

		// Configuration is already sync by the monitors.
		if (msg.author.configs.marry) return msg.sendMessage(msg.language.get('COMMAND_MARRY_AUTHOR_TAKEN'));

		// Check if the target user is already married.
		if (user.configs._syncStatus) await user.configs._syncStatus;
		if (user.configs.marry) return msg.sendMessage(msg.language.get('COMMAND_MARRY_TAKEN'));

		// Get a message from the user.
		await msg.sendMessage(msg.language.get('COMMAND_MARRY_PETITION', msg.author, user));
		const messages = await msg.channel.awaitMessages(message => message.author.id === user.id, { time: 60000, max: 1 });
		if (!messages.size) return msg.sendMessage(msg.language.get('COMMAND_MARRY_NOREPLY'));

		const message = messages.first();
		if (!REGEXP_ACCEPT.test(message.content)) return msg.sendMessage(msg.language.get('COMMAND_MARRY_DENIED'));

		// The user may have tried to marry somebody else while the prompt was running.
		if (user.configs.marry) return msg.sendMessage(msg.language.get('COMMAND_MARRY_TAKEN'));
		if (msg.author.configs.marry) return msg.sendMessage(msg.language.get('COMMAND_MARRY_AUTHOR_TAKEN'));

		await Promise.all([
			msg.author.configs.update('marry', user),
			user.configs.update('marry', msg.author)
		]);

		return msg.sendMessage(msg.language.get('COMMAND_MARRY_ACCEPTED', msg.author, user));
	}

};
