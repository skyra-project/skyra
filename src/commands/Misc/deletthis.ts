import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { CLIENT_ID } from '#root/config';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar, radians } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import type { Message, User } from 'discord.js';
import { join } from 'path';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['deletethis'],
	bucket: 2,
	cooldown: 30,
	description: LanguageKeys.Commands.Misc.DeletThisDescription,
	extendedHelp: LanguageKeys.Commands.Misc.DeletThisExtended,
	requiredPermissions: ['ATTACH_FILES'],
	spam: true,
	usage: '<user:username>'
})
export default class extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: Message, [user]: [User]) {
		const attachment = await this.generate(message, user);
		return message.channel.send({ files: [{ attachment, name: 'deletThis.png' }] });
	}

	public async generate(message: Message, user: User) {
		let target: User | undefined = undefined;
		let author: User | undefined = undefined;
		const { client } = this.context;
		if (user.id === message.author.id && client.options.owners.includes(message.author.id)) throw '💥';
		if (user === message.author) [target, author] = [message.author, client.user!];
		else if (client.options.owners.concat(CLIENT_ID).includes(user.id)) [target, author] = [message.author, user];
		else [target, author] = [user, message.author];

		const [hammered, hammerer] = await Promise.all([fetchAvatar(target, 256), fetchAvatar(author, 256)]);

		return (
			new Canvas(650, 471)
				.printImage(this.kTemplate, 0, 0, 650, 471)

				// Draw the guy with the hammer
				.save()
				.translate(341, 135)
				.rotate(radians(21.8))
				.printCircularImage(hammerer, 0, 0, 77)
				.restore()

				// Draw the who's getting the hammer
				.setTransform(-1, 0, 0, 1, 511, 231)
				.rotate(radians(-25.4))
				.printCircularImage(hammered, 0, 0, 77)

				// Draw the buffer
				.toBufferAsync()
		);
	}

	public async onLoad() {
		this.kTemplate = await loadImage(join(assetsFolder, './images/memes/DeletThis.png'));
	}
}
