const { structures: { Command }, util: { CanvasConstructor, util } } = require('../../index');
const fsn = require('fs-nextra');
const path = require('path');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			botPerms: ['ATTACH_FILES'],
			aliases: ['pray'],
			guildOnly: true,

			cooldown: 30,

			usage: '<user:advuser>',
			description: 'Press F to pray respects.',
			extend: {
				EXPLANATION: [
					'This command generates an image... to pay respects reacting with 🇫. This command also makes Skyra',
					'react the image if she has permissions to react messages.'
				].join(' ')
			}
		});

		this.template = null;
	}

	async run(msg, [user]) {
		const attachment = await this.generate(msg, user);
		return msg.channel.send({ files: [{ attachment, name: 'F.png' }] })
			.then(message => msg.channel.permissionsFor(msg.guild.me).has('ADD_REACTIONS') ? message.react('🇫') : message);
	}

	async generate(msg, user) {
		const praised = await util.fetchAvatar(user, 256);

		return new CanvasConstructor(960, 540)
			.addImage(praised, 349, 87, 109, 109)
			.addImage(this.template, 0, 0, 960, 540)
			.toBufferAsync();
	}

	async init() {
		this.template = await fsn.readFile(path.join(__dirname, '../../assets/images/memes/f.png'));
	}

};
