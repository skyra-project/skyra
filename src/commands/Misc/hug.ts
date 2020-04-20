import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { assetsFolder } from '@utils/constants';
import { fetchAvatar, radians } from '@utils/util';
import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { KlasaMessage, KlasaUser } from 'klasa';
import { join } from 'path';

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 30,
	description: language => language.tget('COMMAND_HUG_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_HUG_EXTENDED'),
	requiredPermissions: ['ATTACH_FILES'],
	runIn: ['text'],
	spam: true,
	usage: '<user:username>'
})
export default class extends SkyraCommand {

	private kTemplate: Buffer | null = null;

	public async run(message: KlasaMessage, [user]: [KlasaUser]) {
		const attachment = await this.generate(message, user);
		return message.channel.send({ files: [{ attachment, name: 'hug.png' }] });
	}

	public async generate(message: KlasaMessage, user: KlasaUser) {
		if (user.id === message.author.id) user = this.client.user!;

		const [hugged, hugger] = await Promise.all([
			fetchAvatar(user, 256),
			fetchAvatar(message.author, 256)
		]);

		return new Canvas(660, 403)
			.addImage(this.kTemplate!, 0, 0, 660, 403)

			// Draw the woman
			.save()
			.setTransform(-1, 0, 0, 1, 178, 146)
			.rotate(radians(33.50))
			.addCircularImage(hugger, 0, 0, 54)
			.restore()

			// Draw the man
			.translate(292, 96)
			.rotate(radians(28.42))
			.addCircularImage(hugged, 0, 0, 49)

			// Draw the buffer
			.toBufferAsync();
	}

	public async init() {
		this.kTemplate = await readFile(join(assetsFolder, './images/memes/hug.png'));
	}

}
