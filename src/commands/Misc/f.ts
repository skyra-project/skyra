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
			aliases: ['pray'],
			bucket: 2,
			cooldown: 30,
			description: language => language.tget('COMMAND_F_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_F_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			usage: '[user:username]'
		});
	}

	public async run(message: KlasaMessage, [user = message.author!]: [KlasaUser]) {
		const attachment = await this.generate(user);
		const response = await message.channel.send({ files: [{ attachment, name: 'F.png' }] }) as KlasaMessage;
		if (response.reactable) await response.react('🇫');
		return response;
	}

	public async generate(user: KlasaUser) {
		const praised = await fetchAvatar(user, 256);

		return new Canvas(960, 540)
			.addImage(praised, 349, 87, 109, 109)
			.addImage(this.template!, 0, 0, 960, 540)
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/f.png'));
	}

}
