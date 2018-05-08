const { Command, util: { fetchAvatar }, assetsFolder } = require('../../index');
const { readFile } = require('fs-nextra');
const { join } = require('path');
const { Canvas } = require('canvas-constructor');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['deletethis'],
			requiredPermissions: ['ATTACH_FILES'],
			bucket: 2,
			cooldown: 30,
			description: (msg) => msg.language.get('COMMAND_DELETTHIS_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_DELETTHIS_EXTENDED'),
			runIn: ['text'],
			usage: '<user:username>'
		});

		this.template = null;
	}

	async run(msg, [user]) {
		const attachment = await this.generate(msg, user);
		return msg.channel.send({ files: [{ attachment, name: 'deletThis.png' }] });
	}

	async generate(msg, user) {
		let selectedUser;
		let hammerer;
		if (user.id === '242043489611808769' === msg.author.id) throw '💥';
		if (user === msg.author) [selectedUser, hammerer] = [msg.author, this.client.user];
		else if (['242043489611808769', '251484593859985411'].includes(user.id)) [selectedUser, hammerer] = [msg.author, user];
		else [selectedUser, hammerer] = [user, msg.author];

		const [Hammered, Hammerer] = await Promise.all([
			fetchAvatar(selectedUser, 256),
			fetchAvatar(hammerer, 256)
		]);

		/* Initialize Canvas */
		return new Canvas(650, 471)
			.addImage(this.template, 0, 0, 650, 471)
			.rotate(0.4)
			.addImage(Hammerer, 297, -77, 154, 154, { type: 'round', radius: 77, restore: true })
			.resetTransformation()
			.rotate(0.46)
			.addImage(Hammered, 495, -77, 154, 154, { type: 'round', radius: 77 })
			.resetTransformation()
			.toBufferAsync();
	}

	async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/DeletThis.png'))
			.catch(error => this.client.emit('wtf', `[COMMAND::INIT] ${this} | Failed to load file:\n${error.stack}`));
	}

};
