import { fetchAvatar, getImage } from '@utils/util';
import { Image, loadImage } from 'canvas';
import { Argument, KlasaMessage, Possible } from 'klasa';

export default class extends Argument {
	public async run(arg: string, possible: Possible, message: KlasaMessage): Promise<Image> {
		// If theres nothing provided, search the channel for an image.
		if (!arg) {
			// Configurable minimum of messages
			const minimum = possible.min || 20;

			// Fetch messages if there are not enough in the channel
			if (message.channel.messages.size < minimum) await message.channel.messages.fetch({ limit: minimum });

			const messages = [...message.channel.messages.values()];
			for (let i = messages.length - 1; i >= 0; --i) {
				const image = getImage(messages[i]);
				if (image) return loadImage(image);
			}

			return fetchAvatar(message.author);
		}

		const user = await this.client.arguments.get('username')!.run(arg, possible, message);
		return fetchAvatar(user);
	}
}
