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
	description: language => language.tget('COMMAND_CUDDLE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_CUDDLE_EXTENDED'),
	requiredPermissions: ['ATTACH_FILES'],
	runIn: ['text'],
	usage: '<user:username>'
})
export default class extends SkyraCommand {

	private kTemplate: Buffer | null = null;

	public async run(message: KlasaMessage, [user]: [KlasaUser]) {
		const attachment = await this.generate(message, user);
		return message.channel.send({ files: [{ attachment, name: 'cuddle.png' }] });
	}

	public async generate(message: KlasaMessage, user: KlasaUser) {
		if (user.id === message.author.id) user = this.client.user!;

		/* Get the buffers from both profile avatars */
		const [man, woman] = await Promise.all([
			fetchAvatar(message.author, 256),
			fetchAvatar(user, 256)
		]);

		return new Canvas(636, 366)
			.addImage(this.kTemplate!, 0, 0, 636, 366)

			// Draw the guy
			.save()
			.translate(248, 70)
			.rotate(radians(47.69))
			.addCircularImage(man, 0, 0, 70)
			.restore()

			// Draw the woman
			.translate(384, 120)
			.rotate(radians(35.28))
			.addCircularImage(woman, 0, 0, 69)

			// Draw the buffer
			.toBufferAsync();
	}

	public async init() {
		this.kTemplate = await readFile(join(assetsFolder, './images/memes/cuddle.png'));
	}

}
