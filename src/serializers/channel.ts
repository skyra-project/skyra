import { Serializer, SerializerUpdateContext } from '#lib/database';
import { ApplyOptions } from '@sapphire/decorators';
import { isCategoryChannel, isGuildBasedChannelByGuildKey, isNewsChannel, isTextChannel, isVoiceChannel } from '@sapphire/discord.js-utilities';
import { Awaitable, isNullish } from '@sapphire/utilities';
import type { Channel } from 'discord.js';

@ApplyOptions<Serializer.Options>({
	aliases: ['guildTextChannel', 'guildVoiceChannel', 'guildCategoryChannel']
})
export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args, { entry }: SerializerUpdateContext) {
		const result = await args.pickResult(entry.type as 'guildTextChannel' | 'guildVoiceChannel' | 'guildCategoryChannel');
		return result.success ? this.ok(result.value.id) : this.errorFromArgument(args, result.error);
	}

	public isValid(value: string, context: SerializerUpdateContext): Awaitable<boolean> {
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
		if (!isGuildBasedChannelByGuildKey(channel)) return false;

		switch (type) {
			case 'textChannel':
				return isTextChannel(channel) || isNewsChannel(channel);
			case 'voiceChannel':
				return isVoiceChannel(channel);
			case 'categoryChannel':
				return isCategoryChannel(channel);
		}

		return false;
	}
}
