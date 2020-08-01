import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { assetsFolder } from '@utils/constants';
import { fetchAvatar } from '@utils/util';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { join } from 'path';

export default class extends SkyraCommand {

	private kTemplate: Image = null!;

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
		const attachment = await this.generate(message.author, text);
		return message.channel.send({ files: [{ attachment, name: 'ChangeMyMind.png' }] });
	}

	public async init() {
		this.kTemplate = await loadImage(join(assetsFolder, '/images/memes/ChangeMyMind.png'));
	}

	private async generate(author: KlasaUser, text: string) {
		const guy = await fetchAvatar(author, 128);

		return new Canvas(591, 607)
			.printImage(this.kTemplate!, 0, 0, 591, 607)

			// Add user's avatar
			.printCircularImage(guy, 155, 73, 41)

			// Add text
			.setTextAlign('center')
			.setColor('rgb(23,23,23)')
			.setTextFont('42px RobotoRegular')
			.createRectangleClip(144, 345, 336, 133)
			.printWrappedText(text, 311, 375, 340)

			// Render
			.toBufferAsync();
	}

}
