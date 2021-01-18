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
	cooldown: 30,
	description: LanguageKeys.Commands.Misc.HugDescription,
	extendedHelp: LanguageKeys.Commands.Misc.HugExtended,
	requiredPermissions: ['ATTACH_FILES'],
	spam: true,
	usage: '<user:username>'
})
export default class extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: Message, [user]: [User]) {
		const attachment = await this.generate(message, user);
		return message.channel.send({ files: [{ attachment, name: 'hug.png' }] });
	}

	public async generate(message: Message, user: User) {
		if (user.id === message.author.id) user = this.context.client.user!;

		const [hugged, hugger] = await Promise.all([fetchAvatar(user, 256), fetchAvatar(message.author, 256)]);

		return (
			new Canvas(660, 403)
				.printImage(this.kTemplate, 0, 0, 660, 403)

				// Draw the woman
				.save()
				.setTransform(-1, 0, 0, 1, 178, 144)
				.rotate(radians(30))
				.printCircularImage(hugger, 0, 0, 54)
				.restore()

				// Draw the man
				.translate(292, 96)
				.rotate(radians(28.42))
				.printCircularImage(hugged, 0, 0, 49)

				// Draw the buffer
				.toBufferAsync()
		);
	}

	public async onLoad() {
		this.kTemplate = await loadImage(join(assetsFolder, './images/memes/hug.png'));
	}
}
