import { Command, util : { fetchAvatar }, assetsFolder; } from; '../../index';
import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { join } from 'path';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['ATTACH_FILES'],
			bucket: 2,
			permissionLevel: 10,
			cooldown: 30,
			description: (language) => language.get('COMMAND_PINGKYRA_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_PINGKYRA_EXTENDED'),
			runIn: ['text'],
			usage: '<user:username>'
		});

		this.template = null;
	}

	public get kyra() {
		return this.client.application.owner;
	}

	public async run(msg, [user]) {
		const attachment = await this.generate(msg, user);
		return msg.channel.send({ files: [{ attachment, name: 'pingkyra.png' }] });
	}

	public async generate(msg, user) {
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

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/pingkyra.png'));
	}

}
