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
			aliases: ['heal', 'healing'],
			bucket: 2,
			cooldown: 30,
			description: language => language.tget('COMMAND_INEEDHEALING_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_INEEDHEALING_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			spam: true,
			usage: '<user:username>'
		});
	}

	public async run(message: KlasaMessage, [user]: [KlasaUser]) {
		const attachment = await this.generate(message, user);
		return message.channel.send({ files: [{ attachment, name: 'INeedHealing.png' }] });
	}

	public async generate(message: KlasaMessage, user: KlasaUser) {
		if (user.id === message.author.id) (user = this.client.user!);

		const [healer, healed] = await Promise.all([
			fetchAvatar(message.author, 128),
			fetchAvatar(user, 128)
		]);

		return new Canvas(333, 500)
			.addImage(this.template!, 0, 0, 333, 500)

			// Draw the healer
			.save()
			.translate(244, 287)
			.rotate(radians(30.42))
			.addCircularImage(healed, 0, 0, 55)
			.restore()

			// Draw the healed boy
			.translate(123, 149)
			.rotate(radians(-31.40))
			.addCircularImage(healer, 0, 0, 53)

			// Draw the buffer
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/ineedhealing.png'));
	}

}
