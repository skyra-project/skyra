const { Command, util: { fetchAvatar }, assetsFolder } = require('../../index');
const { readFile } = require('fs-nextra');
const { join } = require('path');
const { Canvas } = require('canvas-constructor');

module.exports = class extends Command {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['ATTACH_FILES'],
			bucket: 2,
			cooldown: 30,
			description: (language) => language.get('COMMAND_GOODNIGHT_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_GOODNIGHT_EXTENDED'),
			runIn: ['text'],
			usage: '<user:username>'
		});

		this.template = null;
	}

	public async run(msg, [user]) {
		const attachment = await this.generate(msg, user);
		return msg.channel.send({ files: [{ attachment, name: 'goodNight.png' }] });
	}

	public async generate(msg, user) {
		if (user.id === msg.author.id) ({ user } = this.client);

		const [kisser, child] = await Promise.all([
			fetchAvatar(msg.author, 256),
			fetchAvatar(user, 256)
		]);

		return new Canvas(500, 322)
			.addImage(this.template, 0, 0, 636, 366)
			.addImage(kisser, 315, 25, 146, 146, { type: 'round', radius: 73, restore: true })
			.addImage(child, 350, 170, 110, 110, { type: 'round', radius: 55, restore: true })
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/goodnight.png'));
	}

};
