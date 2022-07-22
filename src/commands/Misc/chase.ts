import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { OWNERS, SISTER_CLIENTS } from '#root/config';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar, radians, resolveImageFromFS } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { Canvas, Image } from 'canvas-constructor/napi-rs';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import type { Message, User } from 'discord.js';
import { join } from 'node:path';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Misc.ChaseDescription,
	detailedDescription: LanguageKeys.Commands.Misc.ChaseExtended,
	requiredClientPermissions: [PermissionFlagsBits.AttachFiles]
})
export class UserCommand extends SkyraCommand {
	private KTemplate: Image = null!;
	private readonly reflectedUsers = OWNERS.concat(SISTER_CLIENTS).concat(process.env.CLIENT_ID);

	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const attachment = await this.generate(message, user);
		return send(message, { files: [{ attachment, name: 'chase.png' }] });
	}

	public async generate(message: Message, possibleTarget: User) {
		const { target, user } = this.resolve(message, possibleTarget);
		const [chasedAvatar, chaserAvatar] = await Promise.all([fetchAvatar(target, 128), fetchAvatar(user, 128)]);

		return (
			new Canvas(569, 327)
				.printImage(this.KTemplate, 0, 0, 569, 327)
				.setTransform(-1, 0, 0, 1, 0, 0)

				// Draw chased avatar
				.save()
				.translate(-144, 51)
				.rotate(radians(16.12))
				.printCircularImage(chasedAvatar, 0, 0, 26)
				.restore()

				// Draw chaser avatar
				.translate(-391, 62)
				.rotate(radians(12.26))
				.printCircularImage(chaserAvatar, 0, 0, 25)

				// Draw the buffer
				.pngAsync()
		);
	}

	public async onLoad() {
		this.KTemplate = await resolveImageFromFS(join(assetsFolder, './images/memes/chase.png'));
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
