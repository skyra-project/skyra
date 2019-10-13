import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { join } from 'path';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetchAvatar } from '../../lib/util/util';
import { assetsFolder } from '../../Skyra';
import { CLIENT_ID } from '../../../config';

export default class extends SkyraCommand {

	private template: Buffer | null = null;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 30,
			description: language => language.tget('COMMAND_CHASE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_CHASE_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			usage: '<user:username>'
		});
	}

	public async run(message: KlasaMessage, [user]: [KlasaUser]) {
		const attachment = await this.generate(message, user);
		return message.channel.send({ files: [{ attachment, name: 'chase.png' }] });
	}

	public async generate(message: KlasaMessage, user: KlasaUser) {
		let chased: KlasaUser;
		let chaser: KlasaUser;
		if (user.id === message.author!.id && this.client.options.owners.includes(message.author!.id)) throw '💥';
		if (user === message.author) [chased, chaser] = [message.author!, this.client.user!];
		else if (this.client.options.owners.concat(CLIENT_ID).includes(user.id)) [chased, chaser] = [message.author!, user];
		else [chased, chaser] = [user, message.author!];

		const [chasedAvatar, chaserAvatar] = await Promise.all([
			fetchAvatar(chased, 128),
			fetchAvatar(chaser, 128)
		]);

		return new Canvas(569, 327)
			.addImage(this.template!, 0, 0, 569, 327)
			.addImage(chasedAvatar, 118, 27, 52, 52, { type: 'round', radius: 26, restore: true })
			.addImage(chaserAvatar, 368, 34, 50, 50, { type: 'round', radius: 25, restore: true })
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/chase.png'));
	}

}
