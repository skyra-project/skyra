import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { CommandStore, KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { join } from 'path';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetchAvatar } from '../../lib/util/util';
import { assetsFolder } from '../../Skyra';

export default class extends SkyraCommand {

	private template: Buffer = null;

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['cmm'],
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_CHANGEMYMIND_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_CHANGEMYMIND_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			usage: '<text:string{1,50}>'
		});
	}

	public async run(message: KlasaMessage, [text]: [string]) {
		const attachment = await this.generate(message.author, text);
		return message.channel.send({ files: [{ attachment, name: 'ChangeMyMind.png' }] });
	}

	public async generate(author: KlasaUser, text: string) {
		const guy = await fetchAvatar(author, 128);

		return new Canvas(591, 607)
			.addImage(this.template, 0, 0, 591, 607)

			// Add user's avatar
			.addImage(guy, 114, 32, 82, 82, { type: 'round', radius: 41, restore: true })

			// Add text
			.setColor('rgb(23,23,23)')
			.setTextFont('42px RobotoRegular')
			.createRectClip(144, 345, 336, 133)
			.addMultilineText(text, 141, 375, 340, 48)

			// Render
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, '/images/memes/ChangeMyMind.png'));
	}

}
