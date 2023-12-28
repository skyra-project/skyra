import { Serializer, type DisabledCommandChannel } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { isTextChannel } from '@sapphire/discord.js-utilities';
import type { Awaitable } from '@sapphire/utilities';

export class UserSerializer extends Serializer<DisabledCommandChannel> {
	public async parse(args: Serializer.Args) {
		const channel = await args.pickResult('guildTextChannel');
		if (channel.isErr()) return this.errorFromArgument(args, channel.unwrapErr());

		const commands = await args.repeatResult('command');
		if (commands.isErr()) return this.errorFromArgument(args, commands.unwrapErr());

		return this.ok({ channel: channel.unwrap().id, commands: commands.unwrap().map((command) => command.name) });
	}

	public isValid(value: DisabledCommandChannel, { t, entry, guild }: Serializer.UpdateContext): Awaitable<boolean> {
		const channel = guild.channels.cache.get(value.channel);
		if (!channel) {
			throw new Error(t(LanguageKeys.Serializers.DisabledCommandChannels.ChannelDoesNotExist));
		}

		if (!isTextChannel(channel)) {
			throw t(LanguageKeys.Serializers.InvalidChannel, { name: entry.name });
		}

		for (const command of value.commands) {
			if (!this.container.stores.get('commands').has(command)) {
				throw new Error(t(LanguageKeys.Serializers.DisabledCommandChannels.CommandDoesNotExist, { name: command }));
			}
		}

		return true;
	}

	public override stringify(value: DisabledCommandChannel, { t, guild }: Serializer.UpdateContext): string {
		const name = guild.channels.cache.get(value.channel)?.name ?? t(LanguageKeys.Serializers.UnknownChannel);
		return `[${name} -> ${value.commands.join(' | ')}]`;
	}

	public override equals(left: DisabledCommandChannel, right: DisabledCommandChannel): boolean {
		return left.channel === right.channel;
	}
}
