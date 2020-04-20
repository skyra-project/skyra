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
		let target: KlasaUser;
		let author: KlasaUser;
		if (user.id === message.author.id && this.client.options.owners.includes(message.author.id)) throw '💥';
		if (user === message.author) [target, author] = [message.author, this.client.user!];
		else if (this.client.options.owners.concat(this.skyraID).includes(user.id)) [target, author] = [message.author, user];
		else [target, author] = [user, message.author];

		const [hammered, hammerer] = await Promise.all([
			fetchAvatar(target, 256),
			fetchAvatar(author, 256)
		]);

		return new Canvas(650, 471)
			.addImage(this.template!, 0, 0, 650, 471)

			// Draw the guy with the hammer
			.save()
			.translate(341, 135)
			.rotate(radians(21.80))
			.addCircularImage(hammerer, 0, 0, 77)
			.restore()

			// Draw the who's getting the hammer
			.setTransform(-1, 0, 0, 1, 511, 231)
			.rotate(radians(-25.40))
			.addCircularImage(hammered, 0, 0, 77)

			// Draw the buffer
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/DeletThis.png'));
	}

}
