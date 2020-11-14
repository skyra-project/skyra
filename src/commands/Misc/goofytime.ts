import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { assetsFolder } from '@utils/constants';
import { fetchAvatar, radians } from '@utils/util';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { User } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { join } from 'path';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['goof', 'goofy', 'daddy', 'goofie', 'goofietime'],
	bucket: 2,
	cooldown: 30,
	description: (language) => language.get(LanguageKeys.Commands.Misc.GoofytimeDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Misc.GoofytimeExtended),
	requiredPermissions: ['ATTACH_FILES'],
	spam: true,
	usage: '<user:username>'
})
export default class extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: KlasaMessage, [user]: [User]) {
		const attachment = await this.generate(message, user);
		return message.channel.send({ files: [{ attachment, name: "It's Goofy time.png" }] });
	}

	public async generate(message: KlasaMessage, user: User) {
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
				.toBufferAsync()
		);
	}

	public async init() {
		this.kTemplate = await loadImage(join(assetsFolder, './images/memes/goofy.png'));
	}
}
