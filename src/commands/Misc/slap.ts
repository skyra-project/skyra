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
			description: (language) => language.get('COMMAND_SLAP_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SLAP_EXTENDED'),
			runIn: ['text'],
			usage: '<user:username>'
		});

		this.spam = true;
		this.template = null;
	}

	public async run(msg, [user]) {
		const attachment = await this.generate(msg, user);
		return msg.channel.send({ files: [{ attachment, name: 'slap.png' }] });
	}

	public async generate(msg, user) {
		let selectedUser;
		let slapper;
		if (user.id === '242043489611808769' === msg.author.id) throw '💥';
		if (user === msg.author) [selectedUser, slapper] = [msg.author, this.client.user];
		else if (['242043489611808769', '251484593859985411'].includes(user.id)) [selectedUser, slapper] = [msg.author, user];
		else [selectedUser, slapper] = [user, msg.author];

		const [Slapped, Slapper] = await Promise.all([
			fetchAvatar(selectedUser, 256),
			fetchAvatar(slapper, 256)
		]);

		/* Initialize Canvas */
		return new Canvas(950, 475)
			.addImage(this.template, 0, 0, 950, 475)
			.addImage(Slapper, 410, 107, 131, 131, { type: 'round', radius: 66, restore: true })
			.addImage(Slapped, 159, 180, 169, 169, { type: 'round', radius: 85, restore: true })
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/imageSlap.png'));
	}

};
