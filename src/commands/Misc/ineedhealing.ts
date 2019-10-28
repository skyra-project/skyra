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
			.addImage(healer, 189, 232, 110, 110, { type: 'round', radius: 55, restore: true })
			.addImage(healed, 70, 96, 106, 106, { type: 'round', radius: 53, restore: true })
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/ineedhealing.png'));
	}

}
