const { Command, Slotmachine } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['slot', 'slots', 'slotmachines'],
			requiredPermissions: ['ATTACH_FILES'],
			cooldown: 10,
			bucket: 2,
			description: msg => msg.language.get('COMMAND_SLOTMACHINE_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_SLOTMACHINE_EXTENDED'),
			runIn: ['text'],
			usage: '<50|100|200|500|1000>'
		});
	}

	async run(msg, [text]) {
		const coins = Number(text);
		if (msg.author.configs.money < coins)
			throw msg.language.get('COMMAND_SLOTMACHINES_MONEY', msg.author.configs.money);


		const attachment = await new Slotmachine(msg, coins).run();
		return msg.channel.send({ files: [{ attachment, name: 'Slotmachine.png' }] });
	}

};
