import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { join } from 'path';
import { assetsFolder, Command } from '../../index';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['ATTACH_FILES'],
			bucket: 2,
			cooldown: 30,
			description: (language) => language.get('COMMAND_THESEARCH_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_THESEARCH_EXTENDED'),
			runIn: ['text'],
			usage: '<text:string>'
		});

		this.spam = true;
		this.template = null;
	}

	public async run(msg, [text]) {
		const attachment = await this.generate(text);
		return msg.channel.send({ files: [{ attachment, name: 'TheSearch.png' }] });
	}

	public generate(text) {
		return new Canvas(700, 612)
			.addImage(this.template, 0, 0, 700, 612)
			.setTextAlign('center')
			.setTextFont('19px FamilyFriends')
			.createRectPath(61, 335, 156, 60)
			.clip()
			.addMultilineText(text.toUpperCase(), 139, 360, 156, 28)
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/TheSearch.png'));
	}

}
