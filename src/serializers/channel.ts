import { Serializer, SerializerUpdateContext } from '#lib/database';
import { ApplyOptions } from '@sapphire/decorators';
import { Awaited, isNullish } from '@sapphire/utilities';
import type { Channel } from 'discord.js';

@ApplyOptions<Serializer.Options>({
	aliases: ['textChannel', 'voiceChannel', 'categoryChannel']
})
export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args, { entry }: SerializerUpdateContext) {
		const result = await args.pickResult(entry.type as 'textChannel' | 'voiceChannel' | 'categoryChannel');
		return result.success ? this.ok(result.value.id) : this.errorFromArgument(args, result.error);
	}

	public isValid(value: string, context: SerializerUpdateContext): Awaited<boolean> {
		const channel = context.guild.channels.cache.get(value);
		return !isNullish(channel) && this.isValidChannel(channel, context.entry.type);
	}

	/**
	 * The stringify method to be overwritten in actual Serializers
	 * @param value The data to stringify
	 * @param guild The guild given for context in this call
	 */
	public stringify(value: string, context: SerializerUpdateContext): string {
		return context.guild.channels.cache.get(value)?.name ?? value;
	}

	private isValidChannel(channel: Channel, type: string): boolean {
		if (isNullish(Reflect.get(channel, 'guild'))) return false;
		switch (type) {
			case 'textChannel':
				return channel.type === 'text' || channel.type === 'news';
			case 'voiceChannel':
				return channel.type === 'voice';
			case 'categoryChannel':
				return channel.type === 'category';
		}

		return false;
	}
}
