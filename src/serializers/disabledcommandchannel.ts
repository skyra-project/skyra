import { DisabledCommandChannel, Serializer, SerializerUpdateContext } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Awaited } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<DisabledCommandChannel> {
	public parse(value: string, context: SerializerUpdateContext): Awaited<DisabledCommandChannel> {
		const [channelID, ...commandIDs] = value.split(' ');

		const channel = context.entity.guild.channels.cache.get(channelID);
		if (!channel) {
			throw new Error(context.language.get(LanguageKeys.Serializers.DisabledCommandChannels.ChannelDoesNotExist));
		}

		if (channel.type !== 'text') {
			throw context.language.get(LanguageKeys.Resolvers.InvalidChannel, { name: context.entry.name });
		}

		const commands: string[] = [];
		for (const command of commandIDs) {
			if (!this.client.commands.has(command)) {
				throw new Error(context.language.get(LanguageKeys.Serializers.DisabledCommandChannels.CommandDoesNotExist, { name: command }));
			}

			commands.push(command);
		}

		return { channel: channel.id, commands };
	}

	public isValid(value: DisabledCommandChannel, context: SerializerUpdateContext): Awaited<boolean> {
		const channel = context.entity.guild.channels.cache.get(value.channel);
		if (!channel) {
			throw new Error(context.language.get(LanguageKeys.Serializers.DisabledCommandChannels.ChannelDoesNotExist));
		}

		if (channel.type !== 'text') {
			throw context.language.get(LanguageKeys.Resolvers.InvalidChannel, { name: context.entry.name });
		}

		for (const command of value.commands) {
			if (!this.client.commands.has(command)) {
				throw new Error(context.language.get(LanguageKeys.Serializers.DisabledCommandChannels.CommandDoesNotExist, { name: command }));
			}
		}

		return true;
	}

	public stringify(value: DisabledCommandChannel, context: SerializerUpdateContext): string {
		const name = context.entity.guild.channels.cache.get(value.channel)?.name ?? context.language.get(LanguageKeys.Misc.UnknownChannel);
		return `[${name} -> ${value.commands.join(' | ')}]`;
	}

	public equals(left: DisabledCommandChannel, right: DisabledCommandChannel): boolean {
		return left.channel === right.channel;
	}
}
