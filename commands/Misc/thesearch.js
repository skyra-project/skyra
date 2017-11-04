const { Command, Canvas } = require('../../index');
const { readFile } = require('fs-nextra');
const { join } = require('path');

Canvas
	.registerFont(join(__dirname, '../../assets/fonts/Family-Friends.ttf'), 'FamilyFriends');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			botPerms: ['ATTACH_FILES'],
			guildOnly: true,

			cooldown: 30,

			usage: '<text:string>',
			description: 'Are we the only one in the universe, this man on earth probably knows.',
			extend: {
				EXPLANATION: 'One man on Earth probably knows if there is intelligent life, ask and you shall receive an answer.',
				ARGUMENTS: '<question>',
				EXP_USAGE: [
					['question', 'The sentence that will reveal the truth.']
				],
				EXAMPLES: [
					'Your waifu is not real'
				]
			}
		});

		this.template = null;
	}

	async run(msg, [text]) {
		const attachment = await this.generate(text);
		return msg.channel.send({ files: [{ attachment, name: 'TheSearch.png' }] });
	}

	generate(text) {
		return new Canvas(700, 612)
			.addImage(this.template, 0, 0, 700, 612)
			.setTextAlign('center')
			.setTextFont('19px FamilyFriends')
			.createRectPath(61, 335, 156, 60)
			.clip()
			.addSplitText(text.toUpperCase(), 139, 360, 156, 28)
			.toBufferAsync();
	}

	async init() {
		this.template = await readFile(join(__dirname, '../../assets/images/memes/TheSearch.png'));
	}

};
