const { Command, util: { fetchAvatar }, rootFolder } = require('../../index');
const { readFile } = require('fs-nextra');
const { join } = require('path');
const { Canvas } = require('canvas-constructor');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			botPerms: ['ATTACH_FILES'],
			bucket: 2,
			cooldown: 30,
			description: (msg) => msg.language.get('COMMAND_INEEDHEALING_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_INEEDHEALING_EXTENDED'),
			runIn: ['text'],
			usage: '<user:username>'
		});

		this.spam = true;
		this.template = null;
	}

	async run(msg, [user]) {
		const attachment = await this.generate(msg, user);
		return msg.channel.send({ files: [{ attachment, name: 'INeedHealing.png' }] });
	}

	async generate(msg, user) {
		if (user.id === msg.author.id) user = this.client.user;

		const [healer, healed] = await Promise.all([
			fetchAvatar(msg.author, 128),
			fetchAvatar(user, 128)
		]);

		return new Canvas(333, 500)
			.addImage(this.template, 0, 0, 333, 500)
			.addImage(healer, 189, 232, 110, 110, { type: 'round', radius: 55, restore: true })
			.addImage(healed, 70, 96, 106, 106, { type: 'round', radius: 53, restore: true })
			.toBufferAsync();
	}

	async init() {
		this.template = await readFile(join(rootFolder, './assets/images/memes/ineedhealing.png'))
			.catch(error => this.client.emit('wtf', `[COMMAND::INIT] ${this} | Failed to load file:\n${error.stack}`));
	}

};
