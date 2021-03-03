import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar, radians } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import type { Message } from 'discord.js';
import { join } from 'path';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 15,
	description: LanguageKeys.Commands.Fun.WakandaDescription,
	extendedHelp: LanguageKeys.Commands.Fun.WakandaExtended,
	permissions: ['ATTACH_FILES']
})
export class UserCommand extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('userName').catch(() => message.author);
		const userAvatar = await fetchAvatar(user);
		const attachment = await this.generateImage(userAvatar);

		return message.channel.send({ files: [{ attachment, name: 'we-do-not-do-that-here.png' }] });
	}

	public async onLoad() {
		this.kTemplate = await loadImage(join(assetsFolder, './images/memes/we-do-not-do-that-here.png'));
	}

	private generateImage(avatar: Image) {
		return new Canvas(800, 450)
			.printImage(this.kTemplate, 0, 0)
			.save()
			.translate(316, 115)
			.rotate(radians(10))
			.printCircularImage(avatar, 0, 0, 65)
			.toBufferAsync();
	}
}
