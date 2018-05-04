const { Command } = require('../../index');

const RESPONSE_OPTIONS = { time: 30000, errors: ['time'], max: 1 };

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['connect-four'],
			botPerms: ['USE_EXTERNAL_EMOJIS'],
			cooldown: 0,
			description: msg => msg.language.get('COMMAND_C4_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_C4_EXTENDED'),
			runIn: ['text'],
			usage: '<user:username>'
		});
	}

	async run(msg, [user]) {
		if (user.id === this.client.user.id) throw msg.language.get('COMMAND_C4_SKYRA');
		if (user.bot) throw msg.language.get('COMMAND_C4_BOT');
		if (user.id === msg.author.id) throw msg.language.get('COMMAND_C4_SELF');
		if (this.client.connectFour.has(msg.channel.id)) throw msg.language.get('COMMAND_C4_PROGRESS');

		// ConnectFourManager#alloc returns a function that when getting true, it creates the game. Otherwise it de-alloc.
		const createGame = this.client.connectFour.alloc(msg.channel.id, msg.author, user);

		const prompt = await msg.sendMessage(msg.language.get('COMMAND_C4_PROMPT', msg.author, user));
		const response = await msg.channel.awaitMessages(message => message.author.id === user.id && /^(ye(s|ah?)?|no)$/i.test(message.content), RESPONSE_OPTIONS)
			.then(messages => messages.first())
			.catch(() => false);

		if (response && /ye(s|ah?)?/i.test(response.content)) {
			await createGame(true).run(prompt);
		} else {
			createGame(false);
			await prompt.edit(msg.language.get(response ? 'COMMAND_C4_PROMPT_DENY' : 'COMMAND_C4_PROMPT_TIMEOUT'));
			prompt.nuke(10000);
		}

		this.client.connectFour.delete(msg.channel.id);
	}

};
