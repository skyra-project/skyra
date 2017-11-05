const { structures: { Command }, util: { Stopwatch } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['r'],
			permLevel: 10,

			usage: '<inhibitors|finalizers|monitors|languages|providers|events|commands|extendables|Piece:piece>',
			description: "Reloads a piece, if it's been updated or modified."
		});
	}

	async run(msg, [piece], settings, i18n) {
		if (typeof piece === 'string') {
			const start = new Stopwatch();
			await this.client[piece].loadAll();
			await this.client[piece].init();
			return msg.send(`${i18n.get('COMMAND_RELOAD_ALL', piece)} (Took: ${start.stop()}.)`);
		}

		return piece.reload()
			.then(itm => msg.send(i18n.get('COMMAND_RELOAD', itm.type, itm.name)))
			.catch(err => {
				this.client[`${piece.type}s`].set(piece);
				msg.error(err);
			});
	}

};
