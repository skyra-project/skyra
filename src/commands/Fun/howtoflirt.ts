import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar, radians } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import type { Message, User } from 'discord.js';
import { join } from 'path';

const imageCoordinates = [
	[
		// Tony
		{ center: [211, 53], radius: 18, rotation: radians(-9.78), flip: true },
		{ center: [136, 237], radius: 53, rotation: radians(24.27), flip: true },
		{ center: [130, 385], radius: 34, rotation: radians(17.35), flip: true }
	],
	[
		// Cpt America
		{ center: [326, 67], radius: 50, rotation: radians(-32.47), flip: true },
		{ center: [351, 229], radius: 43, rotation: radians(-8.53), flip: false },
		{ center: [351, 390], radius: 40, rotation: radians(-9.21), flip: false }
	]
] as const;

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['pants'],
	bucket: 2,
	cooldown: 30,
	description: LanguageKeys.Commands.Fun.HowToFlirtDescription,
	extendedHelp: LanguageKeys.Commands.Fun.HowToFlirtExtended,
	requiredPermissions: ['ATTACH_FILES'],
	spam: true,
	usage: '<user:username>'
})
export default class extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: Message, [user]: [User]) {
		const attachment = await this.generate(message, user);
		return message.channel.send({ files: [{ attachment, name: 'HowToFlirt.png' }] });
	}

	public async init() {
		this.kTemplate = await loadImage(join(assetsFolder, '/images/memes/howtoflirt.png'));
	}

	private async generate(message: Message, user: User) {
		if (user.id === message.author.id) user = this.client.user!;

		/* Get the buffers from both profile avatars */
		const images = await Promise.all([fetchAvatar(message.author, 128), fetchAvatar(user, 128)]);

		/* Initialize Canvas */
		return new Canvas(500, 500)
			.printImage(this.kTemplate, 0, 0, 500, 500)
			.process((canvas) => {
				for (const index of [0, 1]) {
					const image = images[index];
					const coordinates = imageCoordinates[index];

					for (const { center, rotation, radius, flip } of coordinates) {
						canvas
							.setTransform(flip ? -1 : 1, 0, 0, 1, center[0], center[1])
							.rotate(flip ? -rotation : rotation)
							.printCircularImage(image, 0, 0, radius);
					}
				}
			})
			.toBufferAsync();
	}
}
