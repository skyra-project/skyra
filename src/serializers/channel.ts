import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Awaited, isNullish } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { Channel } from 'discord.js';
import { AliasPieceOptions } from 'klasa';

@ApplyOptions<AliasPieceOptions>({
	aliases: ['textchannel', 'voicechannel', 'categorychannel']
})
export default class UserSerializer extends Serializer<string> {
	public parse(value: string, { t, entry, guild }: SerializerUpdateContext) {
		const id = UserSerializer.regex.channel.exec(value);
		const channel = id ? guild.channels.cache.get(id[1]) : guild.channels.cache.find((r) => r.name === value);
		if (!channel) {
			return this.error(t(LanguageKeys.Resolvers.InvalidChannel, { name: entry.name }));
		}

		if (this.isValidChannel(channel, entry.type)) {
			return this.ok(channel.id);
		}

		return this.error(t(LanguageKeys.Resolvers.InvalidChannel, { name: entry.name }));
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
