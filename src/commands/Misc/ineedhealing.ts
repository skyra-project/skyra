import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar, radians } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { User } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { join } from 'path';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['heal', 'healing'],
	bucket: 2,
	cooldown: 30,
	description: LanguageKeys.Commands.Misc.IneedhealingDescription,
	extendedHelp: LanguageKeys.Commands.Misc.IneedhealingExtended,
	requiredPermissions: ['ATTACH_FILES'],
	spam: true,
	usage: '<user:username>'
})
export default class extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: KlasaMessage, [user]: [User]) {
		const attachment = await this.generate(message, user);
		return message.channel.send({ files: [{ attachment, name: 'INeedHealing.png' }] });
	}

	public async generate(message: KlasaMessage, user: User) {
		if (user.id === message.author.id) user = this.client.user!;

		const [healer, healed] = await Promise.all([fetchAvatar(message.author, 128), fetchAvatar(user, 128)]);

		return (
			new Canvas(333, 500)
				.printImage(this.kTemplate, 0, 0, 333, 500)

				// Draw the healer
				.save()
				.translate(244, 287)
				.rotate(radians(30.42))
				.printCircularImage(healed, 0, 0, 55)
				.restore()

				// Draw the healed boy
				.translate(123, 149)
				.rotate(radians(-31.4))
				.printCircularImage(healer, 0, 0, 53)

				// Draw the buffer
				.toBufferAsync()
		);
	}

	public async init() {
		this.kTemplate = await loadImage(join(assetsFolder, './images/memes/ineedhealing.png'));
	}
}
