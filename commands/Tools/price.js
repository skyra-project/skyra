const { structures: { Command } } = require('../../index');
const snekie = require('snekfetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			mode: 2,
			cooldown: 15,

			usage: '<from:string> <to:string> [amount:integer]',
			usageDelim: ' ',
			description: 'Convert the currency with this tool.'
		});
	}

	async run(msg, [from, to, amount = 1], settings, i18n) {
		from = from.toUpperCase();
		to = to.toUpperCase();

		const { body } = await snekie
			.get(`https://min-api.cryptocompare.com/data/price?fsym=${from}&tsyms=${to}`);

		if (body.Response === 'Error') throw i18n.get('COMMAND_PRICE_CURRENCY_NOT_FOUND');
		return msg.send(i18n.get('COMMAND_PRICE_CURRENCY', from, to, amount * body[to]));
	}

};
