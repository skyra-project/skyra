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
			aliases: ['night'],
			bucket: 2,
			cooldown: 30,
			description: language => language.tget('COMMAND_GOODNIGHT_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_GOODNIGHT_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			usage: '<user:username>'
		});
	}

	public async run(message: KlasaMessage, [user]: [KlasaUser]) {
		const attachment = await this.generate(message, user);
		return message.channel.send({ files: [{ attachment, name: 'goodNight.png' }] });
	}

	public async generate(message: KlasaMessage, user: KlasaUser) {
		if (user.id === message.author.id) user = this.client.user!;

		const [kisser, child] = await Promise.all([
			fetchAvatar(message.author, 256),
			fetchAvatar(user, 256)
		]);

		return new Canvas(500, 322)
			.addImage(this.template!, 0, 0, 636, 366)

			// Draw the mother
			.save()
			.translate(388, 98)
			.rotate(radians(41.89))
			.addCircularImage(kisser, 0, 0, 73)
			.restore()

			// Draw the kid
			.setTransform(-1, 0, 0, 1, 405, 225)
			.rotate(radians(-27.98))
			.addCircularImage(child, 0, 0, 55)

			// Draw the buffer
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/goodnight.png'));
	}

}
