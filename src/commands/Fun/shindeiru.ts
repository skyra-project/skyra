import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { assetsFolder } from '@utils/constants';
import { fetchAvatar, radians } from '@utils/util';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { User } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { join } from 'path';

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Fun.ShindeiruDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Fun.ShindeiruExtended),
	requiredPermissions: ['ATTACH_FILES'],
	runIn: ['text'],
	spam: true,
	usage: '<user:username>'
})
export default class extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: KlasaMessage, [user]: [User]) {
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
