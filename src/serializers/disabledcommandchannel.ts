import { DisabledCommandChannel, Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Awaited } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<DisabledCommandChannel> {
	public parse(value: string, { t, entry, guild }: SerializerUpdateContext) {
		const [channelID, ...commandIDs] = value.split(' ');

		const channel = guild.channels.cache.get(channelID);
		if (!channel) {
			return this.error(t(LanguageKeys.Serializers.DisabledCommandChannels.ChannelDoesNotExist));
		}

		if (channel.type !== 'text') {
			return this.error(t(LanguageKeys.Resolvers.InvalidChannel, { name: entry.name }));
		}

		const commands: string[] = [];
		for (const command of commandIDs) {
			if (!this.client.commands.has(command)) {
				return this.error(t(LanguageKeys.Serializers.DisabledCommandChannels.CommandDoesNotExist, { name: command }));
			}

			commands.push(command);
		}

		return this.ok({ channel: channel.id, commands });
	}

	public isValid(value: DisabledCommandChannel, { t, entry, guild }: SerializerUpdateContext): Awaited<boolean> {
		const channel = guild.channels.cache.get(value.channel);
		if (!channel) {
			throw new Error(t(LanguageKeys.Serializers.DisabledCommandChannels.ChannelDoesNotExist));
		}

		if (channel.type !== 'text') {
			throw t(LanguageKeys.Resolvers.InvalidChannel, { name: entry.name });
		}

		for (const command of value.commands) {
			if (!this.client.commands.has(command)) {
				throw new Error(t(LanguageKeys.Serializers.DisabledCommandChannels.CommandDoesNotExist, { name: command }));
			}
		}

		return true;
	}

	public stringify(value: DisabledCommandChannel, { t, guild }: SerializerUpdateContext): string {
		const name = guild.channels.cache.get(value.channel)?.name ?? t(LanguageKeys.Misc.UnknownChannel);
		return `[${name} -> ${value.commands.join(' | ')}]`;
	}

	public equals(left: DisabledCommandChannel, right: DisabledCommandChannel): boolean {
		return left.channel === right.channel;
	}
}
