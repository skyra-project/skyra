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
			usage: '<join|view|add> [amount:int]',
			subcommands: true
		});
	}

	async join(message, [amount]) {
		if (this.client.settings.jackpot.some(user => user.id === message.author.id)) return message.sendLocale('COMMAND_JACKPOT_USER_ALREADY_JOINED', [message.author]);
		if (message.author.settings.money < amount) return message.sendlocale('COMMAND_SOCIAL_MISSING_MONEY', [message.author.settings.money]);
		await message.author.settings.update('money', message.author.settings.money - amount);
		return message.sendLocale('COMMAND_JACKPOT_USER_JOIN', [this.client.jackpot.add(message.author.id, amount)]);
	}

	async view(message) {
		if (this.client.settings.jackpot.length === 0) return message.sendLocale('COMMAND_JACKPOT_NOT_FOUND');
		const users = this.client.settings.jackpot.map(async jackpotUser => {
			const userTag = await this.client.fetchTag(jackpotUser.id).catch(() => null);
			return userTag === null ? `Deleted user: ${jackpotUser.amount}` : `${userTag.tag}: ${jackpotUser.amount}`;
		});
		// eslint-disable-next-line
		return message.sendLocale('COMMAND_JACKPOT_USER_LIST', [users, this.client.settings.jackpot.reduce((a, b) => a + b.amount, 0)]);
	}

	async add(message, [amount]) {
		if (!this.client.settings.jackpot.some(user => user.id === message.author.id)) return message.sendLocale('COMMAND_JACKPOT_USER_NOT_FOUND');

		if (message.author.settings.money < amount) return message.sendlocale('COMMAND_SOCIAL_MISSING_MONEY', [message.author.settings.money]);
		await message.author.settings.update('money', message.author.settings.money - amount);

		return message.sendLocale('JACKPOT_USER_ADD', [this.client.jackpot.add(message.author.id, amount)]);
	}

};
