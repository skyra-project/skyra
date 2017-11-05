const { structures: { Command } } = require('../../index');
const snekie = require('snekfetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permLevel: 10,
			mode: 2,

			usage: '[attachment:attachment]',
			description: "Set's the bot's avatar."
		});
	}

	async run(msg, [url]) {
		const result = await snekie.get(url);
		await this.client.user.setAvatar(result.body)
			.catch(Command.handleError);

		return msg.send(`Dear ${msg.author}, I have changed my avatar for you.`);
	}

};
