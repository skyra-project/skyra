import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { CLIENT_ID } from '@root/config';
import { assetsFolder } from '@utils/constants';
import { fetchAvatar, radians } from '@utils/util';
import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { join } from 'path';

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
		if (user.id === message.author.id && this.client.options.owners.includes(message.author.id)) throw '💥';
		if (user === message.author) [chased, chaser] = [message.author, this.client.user!];
		else if (this.client.options.owners.concat(CLIENT_ID).includes(user.id)) [chased, chaser] = [message.author, user];
		else [chased, chaser] = [user, message.author];

		const [chasedAvatar, chaserAvatar] = await Promise.all([
			fetchAvatar(chased, 128),
			fetchAvatar(chaser, 128)
		]);

		return new Canvas(569, 327)
			.addImage(this.template!, 0, 0, 569, 327)
			.setTransform(-1, 0, 0, 1, 0, 0)

			// Draw chased avatar
			.save()
			.translate(-144, 51)
			.rotate(radians(16.12))
			.addCircularImage(chasedAvatar, 0, 0, 26)
			.restore()

			// Draw chaser avatar
			.translate(-391, 62)
			.rotate(radians(12.26))
			.addCircularImage(chaserAvatar, 0, 0, 25)

			// Draw the buffer
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/chase.png'));
	}

}
