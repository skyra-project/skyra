import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { CLIENT_ID } from '#root/config';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar, radians } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { Message, User } from 'discord.js';
import { join } from 'path';

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 30,
	description: LanguageKeys.Commands.Misc.ChaseDescription,
	extendedHelp: LanguageKeys.Commands.Misc.ChaseExtended,
	requiredPermissions: ['ATTACH_FILES'],
	spam: true,
	usage: '<user:username>'
})
export default class extends SkyraCommand {
	private KTemplate: Image = null!;

	public async run(message: Message, [user]: [User]) {
		const attachment = await this.generate(message, user);
		return message.channel.send({ files: [{ attachment, name: 'chase.png' }] });
	}

	public async generate(message: Message, user: User) {
		let chased: User | undefined = undefined;
		let chaser: User | undefined = undefined;
		if (user.id === message.author.id && this.client.options.owners.includes(message.author.id)) throw '💥';
		if (user === message.author) [chased, chaser] = [message.author, this.client.user!];
		else if (this.client.options.owners.concat(CLIENT_ID).includes(user.id)) [chased, chaser] = [message.author, user];
		else [chased, chaser] = [user, message.author];

		const [chasedAvatar, chaserAvatar] = await Promise.all([fetchAvatar(chased, 128), fetchAvatar(chaser, 128)]);

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
				.toBufferAsync()
		);
	}

	public async init() {
		this.KTemplate = await loadImage(join(assetsFolder, './images/memes/chase.png'));
	}
}
