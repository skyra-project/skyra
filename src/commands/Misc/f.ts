import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { Message, User } from 'discord.js';
import { join } from 'path';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['pray'],
	bucket: 2,
	cooldown: 30,
	description: LanguageKeys.Commands.Misc.FDescription,
	extendedHelp: LanguageKeys.Commands.Misc.FExtended,
	requiredPermissions: ['ATTACH_FILES'],
	spam: true,
	usage: '[user:username]'
})
export default class extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: Message, [user = message.author]: [User]) {
		const attachment = await this.generate(user);
		const response = await message.channel.send({ files: [{ attachment, name: 'F.png' }] });
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
