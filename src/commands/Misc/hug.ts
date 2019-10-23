import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { CommandStore, KlasaMessage, KlasaUser, CommandOptions } from 'klasa';
import { join } from 'path';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetchAvatar, ApplyOptions } from '../../lib/util/util';
import { assetsFolder } from '../../lib/util/constants';

@ApplyOptions<CommandOptions>({
	bucket: 2,
	cooldown: 30,
	description: language => language.tget('COMMAND_HUG_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_HUG_EXTENDED'),
	requiredPermissions: ['ATTACH_FILES'],
	runIn: ['text'],
	usage: '<user:username>'
})
export default class extends SkyraCommand {

	private template: Buffer | null = null;

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
			.addImage(this.template!, 0, 0, 660, 403)
			.addImage(hugger, 124, 92, 109, 109, { type: 'round', radius: 54, restore: true })
			.addImage(hugged, 233, 57, 98, 98, { type: 'round', radius: 49, restore: true })
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/hug.png'));
	}

}
