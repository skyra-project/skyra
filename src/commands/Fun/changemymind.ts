import { Command, util : { fetchAvatar }, assetsFolder; } from; '../../index';
import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { join } from 'path';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['cmm'],
			requiredPermissions: ['ATTACH_FILES'],
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_CHANGEMYMIND_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_CHANGEMYMIND_EXTENDED'),
			runIn: ['text'],
			usage: '<text:string{1,50}>'
		});

		this.template = null;
	}

	public async run(msg, [text]) {
		const attachment = await this.generate(msg.author, text);
		return msg.channel.send({ files: [{ attachment, name: 'ChangeMyMind.png' }] });
	}

	public async generate(author, text) {
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
