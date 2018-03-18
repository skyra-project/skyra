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
			description: (msg) => msg.language.get('COMMAND_HUG_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_HUG_EXTENDED'),
			runIn: ['text'],
			usage: '<user:username>'
		});

		this.template = null;
	}

	async run(msg, [user]) {
		const attachment = await this.generate(msg, user);
		return msg.channel.send({ files: [{ attachment, name: 'hug.png' }] });
	}

	async generate(msg, user) {
		if (user.id === msg.author.id) user = this.client.user;

		const [hugged, hugger] = await Promise.all([
			fetchAvatar(user, 256),
			fetchAvatar(msg.author, 256)
		]);

		return new Canvas(660, 403)
			.addImage(this.template, 0, 0, 660, 403)
			.addImage(hugger, 124, 92, 109, 109, { type: 'round', radius: 54, restore: true })
			.addImage(hugged, 233, 57, 98, 98, { type: 'round', radius: 49, restore: true })
			.toBufferAsync();
	}

	async init() {
		this.template = await readFile(join(rootFolder, './assets/images/memes/hug.png'))
			.catch(error => this.client.emit('wtf', `[COMMAND::INIT] ${this} | Failed to load file:\n${error.stack}`));
	}

};
