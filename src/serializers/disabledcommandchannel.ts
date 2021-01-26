import { DisabledCommandChannel, Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { Awaited } from '@sapphire/utilities';

export class UserSerializer extends Serializer<DisabledCommandChannel> {
	public async parse(args: Serializer.Args) {
		const channel = await args.pickResult('textChannel');
		if (!channel.success) return channel;

		const commands = await args.repeatResult('command');
		if (!commands.success) return commands;

		return this.ok({ channel: channel.value.id, commands: commands.value.map((command) => command.name) });
	}

	public isValid(value: DisabledCommandChannel, { t, entry, guild }: SerializerUpdateContext): Awaited<boolean> {
		const channel = guild.channels.cache.get(value.channel);
		if (!channel) {
			throw new Error(t(LanguageKeys.Serializers.DisabledCommandChannels.ChannelDoesNotExist));
		}

		if (channel.type !== 'text') {
			throw t(LanguageKeys.Serializers.InvalidChannel, { name: entry.name });
		}

		for (const command of value.commands) {
			if (!this.context.stores.get('commands').has(command)) {
				throw new Error(t(LanguageKeys.Serializers.DisabledCommandChannels.CommandDoesNotExist, { name: command }));
			}
		}

		return true;
	}

	public stringify(value: DisabledCommandChannel, { t, guild }: SerializerUpdateContext): string {
		const name = guild.channels.cache.get(value.channel)?.name ?? t(LanguageKeys.Serializers.UnknownChannel);
		return `[${name} -> ${value.commands.join(' | ')}]`;
	}

	public equals(left: DisabledCommandChannel, right: DisabledCommandChannel): boolean {
		return left.channel === right.channel;
	}
}
