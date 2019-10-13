import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { join } from 'path';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetchAvatar } from '../../lib/util/util';
import { assetsFolder } from '../../Skyra';

export default class extends SkyraCommand {

	private template: Buffer | null = null;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 30,
			description: language => language.tget('COMMAND_CUDDLE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_CUDDLE_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			usage: '<user:username>'
		});
	}

	public async run(message: KlasaMessage, [user]: [KlasaUser]) {
		const attachment = await this.generate(message, user);
		return message.channel.send({ files: [{ attachment, name: 'cuddle.png' }] });
	}

	public async generate(message: KlasaMessage, user: KlasaUser) {
		if (user.id === message.author!.id) user = this.client.user!;

		/* Get the buffers from both profile avatars */
		const [man, woman] = await Promise.all([
			fetchAvatar(message.author!, 256),
			fetchAvatar(user, 256)
		]);

		return new Canvas(636, 366)
			.addImage(this.template!, 0, 0, 636, 366)
			.addImage(man, 168, -7, 140, 140, { type: 'round', radius: 70, restore: true })
			.addImage(woman, 307, 41, 138, 138, { type: 'round', radius: 69, restore: true })
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/cuddle.png'));
	}

}
