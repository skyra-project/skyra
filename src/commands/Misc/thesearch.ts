import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { assetsFolder } from '@utils/constants';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { CommandStore, KlasaMessage } from 'klasa';
import { join } from 'path';

export default class extends SkyraCommand {
	private kTemplate: Image = null!;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 30,
			description: (language) => language.get(LanguageKeys.Commands.Misc.ThesearchDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Misc.ThesearchExtended),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			spam: true,
			usage: '<text:string>'
		});
	}

	public async run(message: KlasaMessage, [text]: [string]) {
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
