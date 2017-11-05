const { structures: { Command } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['uni', 'vaporwave'],
			spam: true,

			cooldown: 10,

			usage: '<phrase:string>',
			description: 'Unicode characters!',
			extend: {
				EXPLANATION: [
					'Well, what can I tell you? This command turns your messages into unicode monospaced characters. That',
					'is, what humans call \'Ａ　Ｅ　Ｓ　Ｔ　Ｈ　Ｅ　Ｔ　Ｉ　Ｃ\'. I wonder what it means...'
				].join(' '),
				ARGUMENTS: '[string]',
				EXP_USAGE: [
					['phrase', 'The phrase to convert.']
				],
				EXAMPLES: [
					'A E S T H E T I C'
				]
			}
		});
	}

	async run(msg, [string], settings, i18n) {
		let output = '';
		for (let i = 0; i < string.length; i++) output += string[i] === ' ' ? '　' : String.fromCharCode(string.charCodeAt(i) + 0xFEE0);
		return msg.send(i18n.get('COMMAND_UNICODE', output));
	}

};
