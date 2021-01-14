import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar, radians } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { Message, User } from 'discord.js';
import { join } from 'path';

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 30,
	description: LanguageKeys.Commands.Misc.CuddleDescription,
	extendedHelp: LanguageKeys.Commands.Misc.CuddleExtended,
	requiredPermissions: ['ATTACH_FILES'],
	spam: true,
	usage: '<user:username>'
})
export default class extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: Message, [user]: [User]) {
		const attachment = await this.generate(message, user);
		return message.channel.send({ files: [{ attachment, name: 'cuddle.png' }] });
	}

	public async generate(message: Message, user: User) {
		if (user.id === message.author.id) user = this.client.user!;

		/* Get the buffers from both profile avatars */
		const [man, woman] = await Promise.all([fetchAvatar(message.author, 256), fetchAvatar(user, 256)]);

		return (
			new Canvas(636, 366)
				.printImage(this.kTemplate, 0, 0, 636, 366)

				// Draw the guy
				.save()
				.translate(248, 70)
				.rotate(radians(47.69))
				.printCircularImage(man, 0, 0, 70)
				.restore()

				// Draw the woman
				.translate(384, 120)
				.rotate(radians(35.28))
				.printCircularImage(woman, 0, 0, 69)

				// Draw the buffer
				.toBufferAsync()
		);
	}

	public async init() {
		this.kTemplate = await loadImage(join(assetsFolder, './images/memes/cuddle.png'));
	}
}
