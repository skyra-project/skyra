const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 15,
			description: msg => msg.language.get('COMMAND_PRICE_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_PRICE_EXTENDED'),
			usage: '<from:string> <to:string> [amount:integer]',
			usageDelim: ' '
		});
	}

	async run(msg, [from, to, amount = 1]) {
		from = from.toUpperCase();
		to = to.toUpperCase();

		const body = await this.fetchURL(`https://min-api.cryptocompare.com/data/price?fsym=${from}&tsyms=${to}`, 'json');

		if (body.Response === 'Error') throw msg.language.get('COMMAND_PRICE_CURRENCY_NOT_FOUND');
		return msg.sendMessage(msg.language.get('COMMAND_PRICE_CURRENCY', from, to, amount * body[to]));
	}

};
