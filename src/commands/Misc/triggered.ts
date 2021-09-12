import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { assetsFolder, PermissionFlags } from '#utils/constants';
import { fetchAvatar } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { GifEncoder } from '@skyra/gifenc';
import { Canvas, Image, resolveImage, rgba } from 'canvas-constructor/skia';
import type { Message, User } from 'discord.js';
import { join } from 'path';
import { buffer } from 'stream/consumers';

const COORDINATES: readonly [number, number][] = [
	[-25, -25],
	[-50, -13],
	[-42, -34],
	[-14, -10]
];

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Misc.TriggeredDescription,
	extendedHelp: LanguageKeys.Commands.Misc.TriggeredExtended,
	requiredClientPermissions: [PermissionFlags.ATTACH_FILES],
	spam: true
})
export class UserCommand extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('userName').catch(() => message.author);
		const attachment = await this.generate(user);
		return send(message, { files: [{ attachment, name: 'triggered.gif' }] });
	}

	public async generate(user: User) {
		const encoder = new GifEncoder(350, 393);
		const canvas = new Canvas(350, 393);

		const userAvatar = await fetchAvatar(user, 512);

		const stream = encoder.createReadStream();
		encoder.setRepeat(0).setDelay(50).setQuality(100).start();

		for (const [x, y] of COORDINATES) {
			const frame = canvas
				.printImage(userAvatar, x, y, 400, 400)
				.printImage(this.kTemplate, 0, 340, 350, 53)
				.setColor(rgba(255, 100, 0, 0.4))
				.printRectangle(0, 0, 350, 350)
				.getImageData().data;

			encoder.addFrame(frame);
		}

		encoder.finish();

		return buffer(stream);
	}

	public async onLoad() {
		this.kTemplate = await resolveImage(join(assetsFolder, './images/memes/triggered.png'));
	}
}
