import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { User } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { join } from 'path';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['cmm'],
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Fun.ChangeMyMindDescription,
	extendedHelp: LanguageKeys.Commands.Fun.ChangeMyMindExtended,
	requiredPermissions: ['ATTACH_FILES'],
	spam: true,
	usage: '<text:string{1,50}>'
})
export default class extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: KlasaMessage, [text]: [string]) {
		const attachment = await this.generate(message.author, text);
		return message.channel.send({ files: [{ attachment, name: 'ChangeMyMind.png' }] });
	}

	public async init() {
		this.kTemplate = await loadImage(join(assetsFolder, '/images/memes/ChangeMyMind.png'));
	}

	private async generate(author: User, text: string) {
		const guy = await fetchAvatar(author, 128);

		return (
			new Canvas(591, 607)
				.printImage(this.kTemplate, 0, 0, 591, 607)

				// Add user's avatar
				.printCircularImage(guy, 155, 73, 41)

				// Add text
				.setTextAlign('center')
				.setColor('rgb(23,23,23)')
				.setTextFont('42px RobotoRegular')
				.createRectangleClip(144, 345, 336, 133)
				.printWrappedText(text, 311, 375, 340)

				// Render
				.toBufferAsync()
		);
	}
}
