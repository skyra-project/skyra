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
	aliases: ['night'],
	bucket: 2,
	cooldown: 30,
	description: LanguageKeys.Commands.Misc.GoodNightDescription,
	extendedHelp: LanguageKeys.Commands.Misc.GoodNightExtended,
	requiredPermissions: ['ATTACH_FILES'],
	spam: true,
	usage: '<user:username>'
})
export default class extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: Message, [user]: [User]) {
		const attachment = await this.generate(message, user);
		return message.channel.send({ files: [{ attachment, name: 'goodNight.png' }] });
	}

	public async generate(message: Message, user: User) {
		if (user.id === message.author.id) user = this.client.user!;

		const [kisser, child] = await Promise.all([fetchAvatar(message.author, 256), fetchAvatar(user, 256)]);

		return (
			new Canvas(500, 322)
				.printImage(this.kTemplate, 0, 0, 636, 366)

				// Draw the mother
				.save()
				.translate(388, 98)
				.rotate(radians(41.89))
				.printCircularImage(kisser, 0, 0, 73)
				.restore()

				// Draw the kid
				.setTransform(-1, 0, 0, 1, 405, 225)
				.rotate(radians(-27.98))
				.printCircularImage(child, 0, 0, 55)

				// Draw the buffer
				.toBufferAsync()
		);
	}

	public async init() {
		this.kTemplate = await loadImage(join(assetsFolder, './images/memes/goodnight.png'));
	}
}
