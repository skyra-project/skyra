const { Command } = require('klasa');
const { util: { fetchAvatar }, rootFolder } = require.main.exports;
const { readFile } = require('fs-nextra');
const { join } = require('path');
const { Canvas } = require('canvas-constructor');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			botPerms: ['ATTACH_FILES'],
			bucket: 2,
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_SHINDEIRU_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_SHINDEIRU_EXTENDED'),
			runIn: ['text'],
			usage: '<user:username>'
		});

		this.template = null;
	}

	async run(msg, [user]) {
		const attachment = await this.generate(user, msg.author);
		return msg.channel.send({ files: [{ attachment, name: 'Shindeiru.png' }] });
	}

	async generate(target, author) {
		if (target === author) author = this.client.user;

		/* Get the buffers from both profile avatars */
		const [theAliveOne, theDeadOne] = await Promise.all([
			fetchAvatar(author, 128),
			fetchAvatar(target, 256)
		]);

		return new Canvas(500, 668)
			.addImage(this.template, 0, 0, 500, 668)
			.addImage(theDeadOne, 96, 19, 113, 113, { type: 'round', radius: 56.5, restore: true })
			.addImage(theAliveOne, 310, 135, 128, 128, { type: 'round', radius: 64, restore: true })
			.addImage(theDeadOne, 109, 364, 256, 256, { type: 'round', radius: 128, restore: true })
			.toBufferAsync();
	}

	async init() {
		this.template = await readFile(join(rootFolder, './assets/images/memes/Shindeiru.png'))
			.catch(error => this.client.emit('wtf', `[COMMAND::INIT] ${this} | Failed to load file:\n${error.stack}`));
	}

};
