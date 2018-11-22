import { Command, util : { fetchAvatar }, assetsFolder; } from; '../../index';
import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { join } from 'path';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['ATTACH_FILES'],
			bucket: 2,
			cooldown: 30,
			description: (language) => language.get('COMMAND_CUDDLE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_CUDDLE_EXTENDED'),
			runIn: ['text'],
			usage: '<user:username>'
		});

		this.template = null;
	}

	public async run(msg, [user]) {
		const attachment = await this.generate(msg, user);
		return msg.channel.send({ files: [{ attachment, name: 'cuddle.png' }] });
	}

	public async generate(msg, user) {
		if (user.id === msg.author.id) ({ user } = this.client);

		/* Get the buffers from both profile avatars */
		const [man, woman] = await Promise.all([
			fetchAvatar(msg.author, 256),
			fetchAvatar(user, 256)
		]);

		return new Canvas(636, 366)
			.addImage(this.template, 0, 0, 636, 366)
			.addImage(man, 168, -7, 140, 140, { type: 'round', radius: 70, restore: true })
			.addImage(woman, 307, 41, 138, 138, { type: 'round', radius: 69, restore: true })
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/cuddle.png'));
	}

}
