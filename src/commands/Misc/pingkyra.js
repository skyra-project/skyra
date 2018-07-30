const { Command, util: { fetchAvatar }, assetsFolder } = require('../../index');
const { readFile } = require('fs-nextra');
const { join } = require('path');
const { Canvas } = require('canvas-constructor');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['ATTACH_FILES'],
			bucket: 2,
			permissionLevel: 10,
			cooldown: 30,
			description: (language) => language.get('COMMAND_PINGKYRA_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_PINGKYRA_EXTENDED'),
			runIn: ['text'],
			usage: '<user:username>'
		});

		this.spam = true;
		this.kyra = null;
		this.template = null;
	}

	async run(msg, [user]) {
		const attachment = await this.generate(msg, user);
		return msg.channel.send({ files: [{ attachment, name: 'pingkyra.png' }] });
	}

	async generate(msg, user) {
		if (user.id === this.kyra.id || user.id === this.client.user.id) user = msg.author;

		const [runner, kyra] = await Promise.all([
			fetchAvatar(user, 128),
			fetchAvatar(this.kyra, 128)
		]);

		return new Canvas(569, 327)
			.addImage(this.template, 0, 0, 569, 327)
			.addImage(runner, 118, 27, 52, 52, { type: 'round', radius: 26, restore: true })
			.addImage(kyra, 368, 34, 50, 50, { type: 'round', radius: 25, restore: true })
			.toBufferAsync();
	}

	async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/pingkyra.png'))
			.catch(error => this.client.emit('wtf', `[COMMAND::INIT] ${this} | Failed to load file:\n${error.stack}`));
		this.kyra = await this.client.users.fetch(this.client.options.ownerID);
	}

};
