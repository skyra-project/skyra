import { orMix } from '#utils/common';
import { isNewsChannel, isTextChannel } from '@sapphire/discord.js-utilities';
import { Argument, ArgumentContext } from '@sapphire/framework';
import type { NewsChannel, TextChannel } from 'discord.js';

export class UserArgument extends Argument<TextChannel | NewsChannel> {
	private readonly filter = orMix(isTextChannel, isNewsChannel);

	public get channelName(): Argument<TextChannel | NewsChannel> {
		return this.store.get('channelName') as Argument<TextChannel | NewsChannel>;
	}

	public run(argument: string, context: ArgumentContext<TextChannel | NewsChannel>) {
		return this.channelName.run(argument, { ...context, filter: this.filter });
	}
}
