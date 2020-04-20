import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { assetsFolder } from '@utils/constants';
import { fetchAvatar, radians } from '@utils/util';
import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { join } from 'path';

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
		const attachment = await this.generate(user, message.author);
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
			// Draw the dead guy about to attack
			.save()
			.translate(162, 77)
			.rotate(radians(8.58))
			.addCircularImage(theDeadOne, 0, 0, 56.5)
			.restore()

			// Draw Kenshiro
			.save()
			.translate(384, 218)
			.rotate(radians(11.13))
			.addCircularImage(theAliveOne, 0, 0, 64)
			.restore()

			// Draw the dead guy saying nani
			.translate(260, 514)
			.rotate(radians(8.24))
			.addCircularImage(theDeadOne, 0, 0, 128)

			// Draw the buffer
			.toBufferAsync();
	}

}
