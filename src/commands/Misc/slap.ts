import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { CLIENT_ID, OWNERS } from '#root/config';
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
	description: LanguageKeys.Commands.Misc.SlapDescription,
	extendedHelp: LanguageKeys.Commands.Misc.SlapExtended,
	permissions: ['ATTACH_FILES'],
	spam: true
})
export class UserCommand extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const attachment = await this.generate(message, user);
		return message.channel.send({ files: [{ attachment, name: 'slap.png' }] });
	}

	public async generate(message: Message, user: User) {
		let selectedUser: User | undefined = undefined;
		let slapper: User | undefined = undefined;
		if (user.id === message.author.id && OWNERS.includes(message.author.id)) throw '💥';
		if (user === message.author) [selectedUser, slapper] = [message.author, this.context.client.user!];
		else if (OWNERS.concat(CLIENT_ID).includes(user.id)) [selectedUser, slapper] = [message.author, user];
		else [selectedUser, slapper] = [user, message.author];

		const [robin, batman] = await Promise.all([fetchAvatar(selectedUser, 256), fetchAvatar(slapper, 256)]);

		/* Initialize Canvas */
		return (
			new Canvas(950, 475)
				.printImage(this.kTemplate, 0, 0, 950, 475)

				// Draw Batman
				.save()
				.setTransform(-1, 0, 0, 1, 476, 173)
				.rotate(radians(-13.96))
				.printCircularImage(batman, 0, 0, 79)
				.restore()

				// Draw Robin
				.translate(244, 265)
				.rotate(radians(-24.53))
				.printCircularImage(robin, 0, 0, 93)

				// Draw the buffer
				.toBufferAsync()
		);
	}

	public async onLoad() {
		this.kTemplate = await loadImage(join(assetsFolder, './images/memes/slap.png'));
	}
}
