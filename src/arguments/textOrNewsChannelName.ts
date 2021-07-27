import { Argument, ArgumentContext } from '@sapphire/framework';
import type { GuildChannel, NewsChannel, TextChannel } from 'discord.js';

export class UserArgument extends Argument<TextChannel | NewsChannel> {
	public get channelName(): Argument<TextChannel | NewsChannel> {
		return this.store.get('channelName') as Argument<TextChannel | NewsChannel>;
	}

	public run(argument: string, context: ArgumentContext<TextChannel | NewsChannel>) {
		return this.channelName.run(argument, {
			...context,
			filter: (entry: GuildChannel) => entry.type === 'text' || entry.type === 'news'
		});
	}
}
