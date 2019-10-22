import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { join } from 'path';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetchAvatar } from '../../lib/util/util';
import { assetsFolder } from '../../lib/util/constants';

export default class extends SkyraCommand {

	private template: Buffer | null = null;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_SHINDEIRU_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SHINDEIRU_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			usage: '<user:username>'
		});
	}

	public async run(message: KlasaMessage, [user]: [KlasaUser]) {
		const attachment = await this.generate(user, message.author!);
		return message.channel.send({ files: [{ attachment, name: 'Shindeiru.png' }] });
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, '/images/memes/Shindeiru.png'));
	}

	private async generate(target: KlasaUser, author: KlasaUser) {
		if (target === author) author = this.client.user!;

		/* Get the buffers from both profile avatars */
		const [theAliveOne, theDeadOne] = await Promise.all([
			fetchAvatar(author, 128),
			fetchAvatar(target, 256)
		]);

		return new Canvas(500, 668)
			.addImage(this.template!, 0, 0, 500, 668)
			.addImage(theDeadOne, 96, 19, 113, 113, { type: 'round', radius: 56.5, restore: true })
			.addImage(theAliveOne, 310, 135, 128, 128, { type: 'round', radius: 64, restore: true })
			.addImage(theDeadOne, 109, 364, 256, 256, { type: 'round', radius: 128, restore: true })
			.toBufferAsync();
	}

}
