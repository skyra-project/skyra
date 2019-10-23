import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { KlasaMessage, KlasaUser } from 'klasa';
import { join } from 'path';
import { SkyraCommand, SkyraCommandOptions } from '../../lib/structures/SkyraCommand';
import { assetsFolder } from '../../lib/util/constants';
import { ApplyOptions, fetchAvatar } from '../../lib/util/util';

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 30,
	description: language => language.tget('COMMAND_INEEDHEALING_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_INEEDHEALING_EXTENDED'),
	requiredPermissions: ['ATTACH_FILES'],
	runIn: ['text'],
	spam: true,
	usage: '<user:username>'
})
export default class extends SkyraCommand {

	private template: Buffer | null = null;

	public async run(message: KlasaMessage, [user]: [KlasaUser]) {
		const attachment = await this.generate(message, user);
		return message.channel.send({ files: [{ attachment, name: 'INeedHealing.png' }] });
	}

	public async generate(message: KlasaMessage, user: KlasaUser) {
		if (user.id === message.author.id) (user = this.client.user!);

		const [healer, healed] = await Promise.all([
			fetchAvatar(message.author, 128),
			fetchAvatar(user, 128)
		]);

		return new Canvas(333, 500)
			.addImage(this.template!, 0, 0, 333, 500)
			.addImage(healer, 189, 232, 110, 110, { type: 'round', radius: 55, restore: true })
			.addImage(healed, 70, 96, 106, 106, { type: 'round', radius: 53, restore: true })
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/ineedhealing.png'));
	}

}
