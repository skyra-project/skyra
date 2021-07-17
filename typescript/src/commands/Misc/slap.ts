import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { OWNERS, SISTER_CLIENTS } from '#root/config';
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
	private readonly reflectedUsers = OWNERS.concat(SISTER_CLIENTS).concat(process.env.CLIENT_ID);

	public async run(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const attachment = await this.generate(message, user);
		return message.send({ files: [{ attachment, name: 'slap.png' }] });
	}

	public async generate(message: Message, possibleTarget: User) {
		const { target, user } = this.resolve(message, possibleTarget);
		const [robin, batman] = await Promise.all([fetchAvatar(target, 256), fetchAvatar(user, 256)]);

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

	private resolve(message: Message, possibleTarget: User) {
		const targetSelf = possibleTarget.id === message.author.id;
		if (targetSelf) {
			if (!OWNERS.includes(message.author.id)) return { target: message.author, user: this.context.client.user! };
			this.error(LanguageKeys.Commands.Misc.CannotTargetOwner);
		}

		if (this.reflectedUsers.includes(possibleTarget.id)) return { target: message.author, user: possibleTarget };
		return { target: possibleTarget, user: message.author };
	}
}
