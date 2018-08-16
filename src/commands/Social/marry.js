const { Command } = require('klasa');

const REGEXP_ACCEPT = /^(y|ye|yea|yeah|yes)$/i;
const SNEYRA_ID = '338249781594030090';

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			runIn: ['text'],
			cooldown: 30,
			description: (language) => language.get('COMMAND_MARRY_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_MARRY_EXTENDED'),
			usage: '(user:username)'
		});

		this.createCustomResolver('username', async (arg, possible, msg) => {
			if (!arg) return undefined;
			return this.client.arguments.get('username').run(arg, possible, msg);
		});
	}

	run(msg, [user]) {
		return user ? this._marry(msg, user) : this._display(msg);
	}

	async _display(msg) {
		if (!msg.author.settings.marry) return msg.sendLocale('COMMAND_MARRY_NOTTAKEN');
		const username = await msg.guild.fetchName(msg.author.settings.marry);
		return msg.sendLocale('COMMAND_MARRY_WITH', [username || `<@${msg.author.settings.marry}>`]);
	}

	async _marry(msg, user) {
		if (user.id === this.client.user.id) return msg.sendLocale('COMMAND_MARRY_SKYRA');
		if (user.id === SNEYRA_ID) return msg.sendLocale('COMMAND_MARRY_SNEYRA');
		if (user.id === msg.author.id) return msg.sendLocale('COMMAND_MARRY_SELF');
		if (user.bot) return msg.sendLocale('COMMAND_MARRY_BOTS');

		// settings is already sync by the monitors.
		if (msg.author.settings.marry) return msg.sendLocale('COMMAND_MARRY_AUTHOR_TAKEN');

		// Check if the target user is already married.
		await user.settings.sync();
		if (user.settings.marry) return msg.sendLocale('COMMAND_MARRY_TAKEN');

		// Get a message from the user.
		await msg.sendLocale('COMMAND_MARRY_PETITION', [msg.author, user]);
		const messages = await msg.channel.awaitMessages(message => message.author.id === user.id, { time: 60000, max: 1 });
		if (!messages.size) return msg.sendLocale('COMMAND_MARRY_NOREPLY');

		const message = messages.first();
		if (!REGEXP_ACCEPT.test(message.content)) return msg.sendLocale('COMMAND_MARRY_DENIED');

		// The user may have tried to marry somebody else while the prompt was running.
		if (user.settings.marry) return msg.sendLocale('COMMAND_MARRY_TAKEN');
		if (msg.author.settings.marry) return msg.sendLocale('COMMAND_MARRY_AUTHOR_TAKEN');

		await Promise.all([
			msg.author.settings.update('marry', user),
			user.settings.update('marry', msg.author)
		]);

		return msg.sendLocale('COMMAND_MARRY_ACCEPTED', [msg.author, user]);
	}

};
