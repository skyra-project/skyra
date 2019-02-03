import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { CommandStore, KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { join } from 'path';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetchAvatar } from '../../lib/util/util';
import { assetsFolder } from '../../Skyra';

export default class extends SkyraCommand {

	private template: Buffer = null;
	private readonly ownerID = this.client.options.ownerID;
	private readonly skyraID = this.client.user.id;

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['deletethis'],
			bucket: 2,
			cooldown: 30,
			description: (language) => language.get('COMMAND_DELETTHIS_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_DELETTHIS_EXTENDED'),
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
		if (user.id === this.ownerID && message.author.id === this.ownerID) throw '💥';
		if (user === message.author) [selectedUser, hammerer] = [message.author, this.client.user];
		else if ([this.ownerID, this.skyraID].includes(user.id)) [selectedUser, hammerer] = [message.author, user];
		else [selectedUser, hammerer] = [user, message.author];

		const [Hammered, Hammerer] = await Promise.all([
			fetchAvatar(selectedUser, 256),
			fetchAvatar(hammerer, 256)
		]);

		/* Initialize Canvas */
		return new Canvas(650, 471)
			.addImage(this.template, 0, 0, 650, 471)
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
