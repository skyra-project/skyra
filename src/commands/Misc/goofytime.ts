import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { KlasaMessage, KlasaUser } from 'klasa';
import { join } from 'path';
import { SkyraCommand, SkyraCommandOptions } from '../../lib/structures/SkyraCommand';
import { assetsFolder } from '../../lib/util/constants';
import { ApplyOptions, fetchAvatar } from '../../lib/util/util';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['goof', 'goofy', 'daddy', 'goofie', 'goofietime'],
	bucket: 2,
	cooldown: 30,
	description: language => language.tget('COMMAND_GOOFYTIME_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_GOOFYTIME_EXTENDED'),
	requiredPermissions: ['ATTACH_FILES'],
	runIn: ['text'],
	spam: true,
	usage: '<user:username>'
})
export default class extends SkyraCommand {

	private template: Buffer | null = null;

	public async run(message: KlasaMessage, [user]: [KlasaUser]) {
		const attachment = await this.generate(message, user);
		return message.channel.send({ files: [{ attachment, name: 'It\'s Goofy time.png' }] });
	}

	public async generate(message: KlasaMessage, user: KlasaUser) {
		const [goofied, goofy] = await Promise.all([
			fetchAvatar(user, 128),
			fetchAvatar(message.author, 128)
		]);

		return new Canvas(356, 435)
			.addImage(this.template!, 0, 0, 356, 435)
			.addImage(goofy, 199, 52, 92, 92, { type: 'round', radius: 46, restore: true })
			.addImage(goofied, 95, 296, 50, 50, { type: 'round', radius: 25, restore: true })
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/goofy.png'));
	}

}
