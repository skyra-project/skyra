import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar, radians } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { Canvas, Image, loadImage } from 'canvas-constructor/napi-rs';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import type { Message, User } from 'discord.js';
import { join } from 'node:path';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['goof', 'goofy', 'daddy', 'goofie', 'goofietime'],
	description: LanguageKeys.Commands.Misc.GoofyTimeDescription,
	detailedDescription: LanguageKeys.Commands.Misc.GoofyTimeExtended,
	requiredClientPermissions: [PermissionFlagsBits.AttachFiles]
})
export class UserCommand extends SkyraCommand {
	private kTemplate: Image = null!;

	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const attachment = await this.generate(message, user);
		return send(message, { files: [{ attachment, name: "It's Goofy time.png" }] });
	}

	public async generate(message: Message, user: User) {
		const [goofied, goofy] = await Promise.all([fetchAvatar(user, 128), fetchAvatar(message.author, 128)]);

		return (
			new Canvas(356, 435)
				.printImage(this.kTemplate, 0, 0, 356, 435)

				// Draw Goofy
				.printCircularImage(goofy, 245, 98, 46)

				// Draw the kid in the floor
				.translate(120, 321)
				.rotate(radians(-45))
				.printCircularImage(goofied, 0, 0, 25)

				// Draw the buffer
				.pngAsync()
		);
	}

	public async onLoad() {
		this.kTemplate = await loadImage(join(assetsFolder, './images/memes/goofy.png'));
	}
}
