import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { assetsFolder } from '#utils/constants';
import { ApplyOptions } from '@skyra/decorators';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import type { Message } from 'discord.js';
import { join } from 'path';

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 30,
	description: LanguageKeys.Commands.Misc.TheSearchDescription,
	extendedHelp: LanguageKeys.Commands.Misc.TheSearchExtended,
	requiredPermissions: ['ATTACH_FILES'],
	spam: true,
	usage: '<text:string>'
})
export default class extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: Message, [text]: [string]) {
		const attachment = await this.generate(text);
		return message.channel.send({ files: [{ attachment, name: 'TheSearch.png' }] });
	}

	public generate(text: string) {
		return new Canvas(700, 612)
			.printImage(this.kTemplate, 0, 0, 700, 612)
			.setTextAlign('center')
			.setTextFont('19px FamilyFriends')
			.createRectangleClip(61, 335, 156, 60)
			.printWrappedText(text, 143, 360, 156)
			.toBufferAsync();
	}

	public async init() {
		this.kTemplate = await loadImage(join(assetsFolder, './images/memes/TheSearch.png'));
	}
}
