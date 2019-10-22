import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { join } from 'path';
import { CLIENT_ID } from '../../../config';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetchAvatar } from '../../lib/util/util';
import { assetsFolder } from '../../lib/util/constants';

export default class extends SkyraCommand {

	private template: Buffer | null = null;
	private readonly skyraID = CLIENT_ID;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['deletethis'],
			bucket: 2,
			cooldown: 30,
			description: language => language.tget('COMMAND_DELETTHIS_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_DELETTHIS_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			usage: '<user:username>'
		});
	}

	public async run(message: KlasaMessage, [user]: [KlasaUser]) {
		const attachment = await this.generate(message, user);
		return message.channel.send({ files: [{ attachment, name: 'deletThis.png' }] });
	}

	public async generate(message: KlasaMessage, user: KlasaUser) {
		let selectedUser: KlasaUser;
		let hammerer: KlasaUser;
		if (user.id === message.author!.id && this.client.options.owners.includes(message.author!.id)) throw '💥';
		if (user === message.author) [selectedUser, hammerer] = [message.author!, this.client.user!];
		else if (this.client.options.owners.concat(this.skyraID).includes(user.id)) [selectedUser, hammerer] = [message.author!, user];
		else [selectedUser, hammerer] = [user, message.author!];

		const [Hammered, Hammerer] = await Promise.all([
			fetchAvatar(selectedUser, 256),
			fetchAvatar(hammerer, 256)
		]);

		/* Initialize Canvas */
		return new Canvas(650, 471)
			.addImage(this.template!, 0, 0, 650, 471)
			.rotate(0.4)
			.addImage(Hammerer, 297, -77, 154, 154, { type: 'round', radius: 77, restore: true })
			.resetTransformation()
			.rotate(0.46)
			.addImage(Hammered, 495, -77, 154, 154, { type: 'round', radius: 77 })
			.resetTransformation()
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/DeletThis.png'));
	}

}
