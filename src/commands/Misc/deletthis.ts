import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { OWNERS, SISTER_CLIENTS } from '#root/config';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar, radians } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { Canvas, Image, resolveImage } from 'canvas-constructor/skia';
import { PermissionFlagsBits } from 'discord-api-types/payloads/v9';
import type { Message, User } from 'discord.js';
import { join } from 'path';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['deletethis'],
	description: LanguageKeys.Commands.Misc.DeletThisDescription,
	extendedHelp: LanguageKeys.Commands.Misc.DeletThisExtended,
	requiredClientPermissions: [PermissionFlagsBits.AttachFiles],
	spam: true
})
export class UserCommand extends SkyraCommand {
	private kTemplate: Image = null!;
	private readonly reflectedUsers = OWNERS.concat(SISTER_CLIENTS).concat(process.env.CLIENT_ID);

	public async run(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const attachment = await this.generate(message, user);
		return send(message, { files: [{ attachment, name: 'deletThis.png' }] });
	}

	public async generate(message: Message, possibleTarget: User) {
		const { target, user } = this.resolve(message, possibleTarget);
		const [hammered, hammerer] = await Promise.all([fetchAvatar(target, 256), fetchAvatar(user, 256)]);

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
				.png()
		);
	}

	public async onLoad() {
		this.kTemplate = await resolveImage(join(assetsFolder, './images/memes/DeletThis.png'));
	}

	private resolve(message: Message, possibleTarget: User) {
		const targetSelf = possibleTarget.id === message.author.id;
		if (targetSelf) {
			if (!OWNERS.includes(message.author.id)) return { target: message.author, user: this.container.client.user! };
			this.error(LanguageKeys.Commands.Misc.CannotTargetOwner);
		}

		if (this.reflectedUsers.includes(possibleTarget.id)) return { target: message.author, user: possibleTarget };
		return { target: possibleTarget, user: message.author };
	}
}
