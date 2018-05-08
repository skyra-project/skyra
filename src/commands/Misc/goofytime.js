const { Command, util: { fetchAvatar }, assetsFolder } = require('../../index');
const { readFile } = require('fs-nextra');
const { join } = require('path');
const { Canvas } = require('canvas-constructor');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['goof', 'goofy', 'daddy'],
			requiredPermissions: ['ATTACH_FILES'],
			bucket: 2,
			cooldown: 30,
			description: (msg) => msg.language.get('COMMAND_GOOFYTIME_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_GOOFYTIME_EXTENDED'),
			runIn: ['text'],
			usage: '<user:username>'
		});

		this.spam = true;
		this.template = null;
	}

	async run(msg, [user]) {
		const attachment = await this.generate(msg, user);
		return msg.channel.send({ files: [{ attachment, name: 'It\'s Goofy time.png' }] });
	}

	async generate(msg, user) {
		const goofied = await fetchAvatar(user, 128);

		return new Canvas(356, 435)
			.addImage(this.template, 0, 0, 356, 435)
			.addImage(goofied, 199, 52, 92, 92, { type: 'round', radius: 46 })
			.toBufferAsync();
	}

	async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/goofy.png'))
			.catch(error => this.client.emit('wtf', `[COMMAND::INIT] ${this} | Failed to load file:\n${error.stack}`));
	}

};
