import { Serializer, SerializerUpdateContext } from '#lib/database/index';
import { isNullish } from '#lib/misc/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Awaited } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { Channel } from 'discord.js';
import { AliasPieceOptions } from 'klasa';

@ApplyOptions<AliasPieceOptions>({
	aliases: ['textchannel', 'voicechannel', 'categorychannel']
})
export default class UserSerializer extends Serializer<string> {
	public parse(value: string, context: SerializerUpdateContext) {
		const id = UserSerializer.regex.channel.exec(value);
		const channel = id ? context.guild.channels.cache.get(id[1]) : context.guild.channels.cache.find((r) => r.name === value);
		if (!channel) {
			return this.error(context.language.get(LanguageKeys.Resolvers.InvalidChannel, { name: context.entry.name }));
		}

		if (this.isValidChannel(channel, context.entry.type)) {
			return this.ok(channel.id);
		}

		return this.error(context.language.get(LanguageKeys.Resolvers.InvalidChannel, { name: context.entry.name }));
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
			case 'textchannel':
				return channel.type === 'text' || channel.type === 'news';
			case 'voicechannel':
				return channel.type === 'voice';
			case 'categorychannel':
				return channel.type === 'category';
		}

		return false;
	}
}
