import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { join } from 'path';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetchAvatar } from '../../lib/util/util';
import { assetsFolder } from '../../Skyra';
import { User } from 'discord.js';

export default class extends SkyraCommand {

	private template: Buffer | null = null;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 30,
			description: language => language.get('COMMAND_PINGKYRA_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_PINGKYRA_EXTENDED'),
			permissionLevel: 10,
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			usage: '<user:username>'
		});
	}

	public get kyra() {
		return this.client.application.owner as User;
	}

	public async run(message: KlasaMessage, [user]: [KlasaUser]) {
		const attachment = await this.generate(message, user);
		return message.channel.send({ files: [{ attachment, name: 'pingkyra.png' }] });
	}

	public async generate(message: KlasaMessage, user: KlasaUser) {
		if (user.id === this.kyra.id || user.id === this.client.user!.id) user = message.author!;

		const [runner, kyra] = await Promise.all([
			fetchAvatar(user, 128),
			fetchAvatar(this.kyra, 128)
		]);

		return new Canvas(569, 327)
			.addImage(this.template!, 0, 0, 569, 327)
			.addImage(runner, 118, 27, 52, 52, { type: 'round', radius: 26, restore: true })
			.addImage(kyra, 368, 34, 50, 50, { type: 'round', radius: 25, restore: true })
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/pingkyra.png'));
	}

}
