const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['draw'],
			cooldown: 10,
			bucket: 2,
			description: (language) => language.get('COMMAND_JACKPOT_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_JACKPOT_EXTENDED'),
			runIn: ['text'],
			usage: '<view|add> [amount:int]',
			usageDelim: ' ',
			subcommands: true
		});
	}

	async view(message) {
		if (this.client.settings.jackpot.length === 0) return message.sendLocale('COMMAND_JACKPOT_NOT_FOUND');

		const users = [];

		for (const user of this.client.settings.jackpot) {
			try {
				const tag = await this.client.fetchTag(user.id);
				users.push(`${tag}: ${user.amount}${require.main.exports.constants.EMOJIS.SHINY}`);
			} catch (e) {
				users.push(`Deleted user: ${user.amount}${require.main.exports.constants.EMOJIS.SHINY}`);
			}
		}
		return message.sendLocale('COMMAND_JACKPOT_USER_LIST', [users, this.client.settings.jackpot.reduce((a, b) => a + b.amount, 0)]);
	}

	async add(message, [amount]) {
		const isAlreadyInJackpot = this.client.settings.jackpot.some(user => user.id === message.author.id);

		if (message.author.settings.money < amount) return message.sendLocale('COMMAND_SOCIAL_MISSING_MONEY', [message.author.settings.money]);
		await message.author.settings.update('money', message.author.settings.money - amount);

		return message.sendLocale(isAlreadyInJackpot ? 'COMMAND_JACKPOT_USER_JOIN' : 'COMMAND_JACKPOT_USER_ADD', [await this.client.jackpot.add(message.author.id, amount)]);
	}

};
