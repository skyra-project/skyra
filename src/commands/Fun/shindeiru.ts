import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar, radians } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import type { Message, User } from 'discord.js';
import { join } from 'path';

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Fun.ShindeiruDescription,
	extendedHelp: LanguageKeys.Commands.Fun.ShindeiruExtended,
	requiredPermissions: ['ATTACH_FILES'],
	spam: true,
	usage: '<user:username>'
})
export default class extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: Message, [user]: [User]) {
		const attachment = await this.generate(user, message.author);
		return message.channel.send({ files: [{ attachment, name: 'Shindeiru.png' }] });
	}

	public async init() {
		this.kTemplate = await loadImage(join(assetsFolder, '/images/memes/Shindeiru.png'));
	}

	private async generate(target: User, author: User) {
		if (target === author) author = this.client.user!;

		/* Get the buffers from both profile avatars */
		const [theAliveOne, theDeadOne] = await Promise.all([fetchAvatar(author, 128), fetchAvatar(target, 256)]);

		return (
			new Canvas(500, 668)
				.printImage(this.kTemplate, 0, 0, 500, 668)
				// Draw the dead guy about to attack
				.save()
				.translate(162, 77)
				.rotate(radians(8.58))
				.printCircularImage(theDeadOne, 0, 0, 56.5)
				.restore()

				// Draw Kenshiro
				.save()
				.translate(384, 218)
				.rotate(radians(11.13))
				.printCircularImage(theAliveOne, 0, 0, 64)
				.restore()

				// Draw the dead guy saying nani
				.translate(260, 514)
				.rotate(radians(8.24))
				.printCircularImage(theDeadOne, 0, 0, 128)

				// Draw the buffer
				.toBufferAsync()
		);
	}
}
