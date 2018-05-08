const { Command, util: { fetchAvatar }, assetsFolder } = require('../../index');
const { readFile } = require('fs-nextra');
const { join } = require('path');
const { Canvas } = require('canvas-constructor');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['pray'],
			requiredPermissions: ['ATTACH_FILES'],
			bucket: 2,
			cooldown: 30,
			description: (msg) => msg.language.get('COMMAND_F_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_F_EXTENDED'),
			runIn: ['text'],
			usage: '[user:username]'
		});

		this.template = null;
	}

	async run(msg, [user = msg.author]) {
		const attachment = await this.generate(msg, user);
		return msg.channel.send({ files: [{ attachment, name: 'F.png' }] })
			.then(message => msg.channel.permissionsFor(msg.guild.me).has('ADD_REACTIONS') ? message.react('🇫') : message);
	}

	async generate(msg, user) {
		const praised = await fetchAvatar(user, 256);

		return new Canvas(960, 540)
			.addImage(praised, 349, 87, 109, 109)
			.addImage(this.template, 0, 0, 960, 540)
			.toBufferAsync();
	}

	async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/f.png'))
			.catch(error => this.client.emit('wtf', `[COMMAND::INIT] ${this} | Failed to load file:\n${error.stack}`));
	}

};
