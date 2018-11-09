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
		if (this.client.jackpot.users.some(user => user.id === message.author.id)) return message.sendLocale('COMMAND_JACKPOT_USER_ALREADY_JOINED', [message.author]);
		if (message.author.settings.money < amount) return message.sendlocale('COMMAND_SLOTMACHINES_MONEY', [message.author.settings.money]);
		await message.author.settings.update('money', message.author.settings.money - amount);
		return message.sendLocale('COMMAND_JACKPOT_USER_JOIN', [this.client.jackpot.add(message.author.id, amount)]);
	}

	async view(message) {
		if (this.client.jackpot.users.length === 0) return message.sendLocale('COMMAND_JACKPOT_NOT_FOUND');
		const users = this.client.jackpot.users.map(async jackpotUser => {
			const userResolved = await this.client.users.fetch(jackpotUser.id);
			if (userResolved === null) return `Deleted user: ${jackpotUser.amount}`;
			return `${userResolved.tag}: ${jackpotUser.amount}`;
		});
		// eslint-disable-next-line
		return message.sendLocale('COMMAND_JACKPOT_USER_LIST', [users, this.client.jackpot.users.reduce((a, b) => { a.amount += b.amount; })]);
	}

	async add(message, [amount]) {
		if (!this.client.jackpot.users.some(user => user.id === message.author.id)) return message.sendLocale('COMMAND_JACKPOT_USER_NOT_FOUND');

		if (message.author.settings.money < amount) return message.sendlocale('COMMAND_SLOTMACHINES_MONEY', [message.author.settings.money]);
		await message.author.settings.update('money', message.author.settings.money - amount);

		return message.sendLocale('JACKPOT_USER_ADD', [this.client.jackpot.add(message.author.id, amount)]);
	}

	async init() {
		await this.client.jackpot.init();
	}

};
