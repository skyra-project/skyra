import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { assetsFolder } from '@utils/constants';
import { fetchAvatar } from '@utils/util';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { User } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { join } from 'path';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['pray'],
	bucket: 2,
	cooldown: 30,
	description: (language) => language.get(LanguageKeys.Commands.Misc.FDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Misc.FExtended),
	requiredPermissions: ['ATTACH_FILES'],
	runIn: ['text'],
	spam: true,
	usage: '[user:username]'
})
export default class extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: KlasaMessage, [user = message.author]: [User]) {
		const attachment = await this.generate(user);
		const response = (await message.channel.send({ files: [{ attachment, name: 'F.png' }] })) as KlasaMessage;
		if (response.reactable) await response.react('🇫');
		return response;
	}

	public async generate(user: User) {
		const praised = await fetchAvatar(user, 256);

		return (
			new Canvas(960, 540)
				// Draw the avatar
				.setTransform(1, -0.1, 0.1, 1, 342, 88)
				.printImage(praised, 0, 0, 109, 109)

				// Draw the template
				.resetTransformation()
				.printImage(this.kTemplate, 0, 0, 960, 540)

				// Draw the buffer
				.toBufferAsync()
		);
	}

	public async init() {
		this.kTemplate = await loadImage(join(assetsFolder, './images/memes/f.png'));
	}
}
