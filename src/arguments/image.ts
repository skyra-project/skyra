import { Possible, Argument, KlasaMessage } from 'klasa';
import { fetch, getImage, FetchResultTypes, fetchAvatar } from '@utils/util';


export default class extends Argument {

	public async run(arg: string, possible: Possible, message: KlasaMessage) {
		// If theres nothing provided, search the channel for an image.
		if (!arg) {
			// Fetch messages if there are not enough in the channel
			if (message.channel.messages.size < 20) await message.channel.messages.fetch({ limit: 20 });

			const messages = [...message.channel.messages.values()];
			for (let i = messages.length - 1; i >= 0; --i) {
				const image = getImage(messages[i]);
				if (image) return fetch(image, FetchResultTypes.Buffer);
			}

			return fetchAvatar(message.author);
		}

		const user = await this.client.arguments.get('username')!.run(arg, possible, message);
		return fetchAvatar(user);
	}

}
