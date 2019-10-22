import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { CommandStore, KlasaMessage } from 'klasa';
import { join } from 'path';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { assetsFolder } from '../../lib/util/constants';

export default class extends SkyraCommand {

	private template: Buffer | null = null;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 30,
			description: language => language.tget('COMMAND_THESEARCH_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_THESEARCH_EXTENDED'),
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
			.addImage(this.template!, 0, 0, 700, 612)
			.setTextAlign('center')
			.setTextFont('19px FamilyFriends')
			.createRectClip(61, 335, 156, 60)
			.addWrappedText(text, 143, 360, 156)
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/TheSearch.png'));
	}

}
