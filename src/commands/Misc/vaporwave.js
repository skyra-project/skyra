const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 5,
			description: (msg) => msg.language.get('COMMAND_VAPORWAVE_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_VAPORWAVE_EXTENDED'),
			usage: '<phrase:string>'
		});

		this.spam = true;
	}

	async run(msg, [string]) {
		let output = '';
		for (let i = 0; i < string.length; i++) output += string[i] === ' ' ? '　' : String.fromCharCode(string.charCodeAt(i) + 0xFEE0);
		return msg.sendLocale('COMMAND_VAPORWAVE_OUTPUT', [output]);
	}

};
