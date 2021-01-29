import { cast, fetchAvatar } from '#utils/util';
import { Argument, ArgumentContext } from '@sapphire/framework';
import type { Image } from 'canvas';
import { User } from 'discord.js';

export class UserArgument extends Argument<Image> {
	private get userName(): Argument<User> {
		return this.store.get('userName') as Argument<User>;
	}

	public async run(parameter: string, context: ArgumentContext<Image>) {
		// // If theres nothing provided, search the channel for an image.
		// if (!arg) {
		// 	// ! TODO: Re-enable after moving to sapphire!!
		// 	/*
		// 	// Configurable minimum of messages
		// 	const minimum = possible.min || 20;

		// 	// Fetch messages if there are not enough in the channel
		// 	if (message.channel.messages.size < minimum) await message.channel.messages.fetch({ limit: minimum });

		// 	const messages = [...message.channel.messages.values()];
		// 	for (let i = messages.length - 1; i >= 0; --i) {
		// 		const imageSrc = getImage(messages[i]);
		// 		if (imageSrc) return loadImage(imageSrc);
		// 	}
		// 	*/

		// 	return fetchAvatar(message.author);
		// }

		const user = await this.userName.run(parameter, cast<ArgumentContext<User>>(context));
		if (!user.success) return user;

		try {
			return this.ok(await fetchAvatar(user.value));
		} catch {
			// TODO: Add language key
			return this.error({ parameter, identifier: 'TBD' });
		}
	}
}
