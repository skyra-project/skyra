import { Argument, ArgumentContext } from '@sapphire/framework';
import type { GuildChannel, TextChannel } from 'discord.js';

export class UserArgument extends Argument<TextChannel> {
	public get channelName(): Argument<TextChannel> {
		return this.store.get('channelName') as Argument<TextChannel>;
	}

	public run(argument: string, context: ArgumentContext<TextChannel>) {
		return this.channelName.run(argument, { ...context, filter: (entry: GuildChannel) => entry.type === 'text' });
	}
}
