import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { assetsFolder } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Canvas, resolveImage } from 'canvas-constructor';
import type { Message } from 'discord.js';
import { join } from 'path';
import type { Image } from 'skia-canvas';

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 30,
	description: LanguageKeys.Commands.Misc.TheSearchDescription,
	extendedHelp: LanguageKeys.Commands.Misc.TheSearchExtended,
	permissions: ['ATTACH_FILES'],
	spam: true
})
export class UserCommand extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: Message, args: SkyraCommand.Args) {
		const text = await args.rest('string');
		const attachment = this.generate(text);
		return message.channel.send({ files: [{ attachment, name: 'TheSearch.png' }] });
	}

	public generate(text: string) {
		return new Canvas(700, 612)
			.printImage(this.kTemplate, 0, 0, 700, 612)
			.setTextAlign('center')
			.setTextFont('19px FamilyFriends')
			.createRectangleClip(61, 335, 156, 60)
			.printWrappedText(text, 143, 360, 156)
			.toBuffer();
	}

	public async onLoad() {
		this.kTemplate = await resolveImage(join(assetsFolder, './images/memes/TheSearch.png'));
	}
}
