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
			.addImage(kisser, 315, 25, 146, 146, { type: 'round', radius: 73, restore: true })
			.addImage(child, 350, 170, 110, 110, { type: 'round', radius: 55, restore: true })
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/goodnight.png'));
	}

}
