const { Command, util: { fetchAvatar }, assetsFolder } = require('../../index');
const { readFile } = require('fs-nextra');
const { join } = require('path');
const { Canvas } = require('canvas-constructor');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['cmm'],
			requiredPermissions: ['ATTACH_FILES'],
			bucket: 2,
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_CHANGEMYMIND_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_CHANGEMYMIND_EXTENDED'),
			runIn: ['text'],
			usage: '<text:string{1,50}>'
		});

		this.template = null;
	}

	async run(msg, [text]) {
		const attachment = await this.generate(msg.author, text);
		return msg.channel.send({ files: [{ attachment, name: 'ChangeMyMind.png' }] });
	}

	async generate(author, text) {
		const guy = await fetchAvatar(author, 128);

		return new Canvas(591, 607)
			.addImage(this.template, 0, 0, 591, 607)

			// Add user's avatar
			.addImage(guy, 114, 32, 82, 82, { type: 'round', radius: 41, restore: true })

			// Add text
			.setColor('rgb(23,23,23)')
			.setTextFont('42px RobotoRegular')
			.createRectClip(144, 345, 336, 133)
			.addMultilineText(text, 141, 375, 340, 48)

			// Render
			.toBufferAsync();
	}

	async init() {
		this.template = await readFile(join(assetsFolder, '/images/memes/ChangeMyMind.png'))
			.catch(error => this.client.emit('wtf', `[COMMAND::INIT] ${this} | Failed to load file:\n${error.stack}`));
	}

};
