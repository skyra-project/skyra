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
			description: (language) => language.get('COMMAND_HUG_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_HUG_EXTENDED'),
			runIn: ['text'],
			usage: '<user:username>'
		});

		this.template = null;
	}

	public async run(msg, [user]) {
		const attachment = await this.generate(msg, user);
		return msg.channel.send({ files: [{ attachment, name: 'hug.png' }] });
	}

	public async generate(msg, user) {
		if (user.id === msg.author.id) ({ user } = this.client);

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

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/hug.png'));
	}

}
