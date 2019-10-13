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
			aliases: ['cmm'],
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_CHANGEMYMIND_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_CHANGEMYMIND_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			usage: '<text:string{1,50}>'
		});
	}

	public async run(message: KlasaMessage, [text]: [string]) {
		const attachment = await this.generate(message.author!, text);
		return message.channel.send({ files: [{ attachment, name: 'ChangeMyMind.png' }] });
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, '/images/memes/ChangeMyMind.png'));
	}

	private async generate(author: KlasaUser, text: string) {
		const guy = await fetchAvatar(author, 128);

		return new Canvas(591, 607)
			.addImage(this.template!, 0, 0, 591, 607)

			// Add user's avatar
			.addImage(guy, 114, 32, 82, 82, { type: 'round', radius: 41, restore: true })

			// Add text
			.setTextAlign('center')
			.setColor('rgb(23,23,23)')
			.setTextFont('42px RobotoRegular')
			.createRectClip(144, 345, 336, 133)
			.addWrappedText(text, 311, 375, 340)

			// Render
			.toBufferAsync();
	}

}
