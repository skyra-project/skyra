const { Command, util: { fetchAvatar }, assetsFolder } = require('../../index');
const { readFile } = require('fs-nextra');
const { join } = require('path');
const { Canvas } = require('canvas-constructor');

export default class extends Command {

	public constructor(client: Skyra, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['goof', 'goofy', 'daddy', 'goofie', 'goofietime'],
			requiredPermissions: ['ATTACH_FILES'],
			bucket: 2,
			cooldown: 30,
			description: (language) => language.get('COMMAND_GOOFYTIME_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_GOOFYTIME_EXTENDED'),
			runIn: ['text'],
			usage: '<user:username>'
		});

		this.spam = true;
		this.template = null;
	}

	public async run(msg, [user]) {
		const attachment = await this.generate(msg, user);
		return msg.channel.send({ files: [{ attachment, name: 'It\'s Goofy time.png' }] });
	}

	public async generate(msg, user) {
		const [goofied, goofy] = await Promise.all([
			fetchAvatar(user, 128),
			fetchAvatar(msg.author, 128)
		]);

		return new Canvas(356, 435)
			.addImage(this.template, 0, 0, 356, 435)
			.addImage(goofy, 199, 52, 92, 92, { type: 'round', radius: 46, restore: true })
			.addImage(goofied, 95, 296, 50, 50, { type: 'round', radius: 25, restore: true })
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/goofy.png'));
	}

}
