import { DisabledCommandChannel, Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { UserError } from '@sapphire/framework';
import type { Awaited } from '@sapphire/utilities';

export class UserSerializer extends Serializer<DisabledCommandChannel> {
	public async parse(args: Serializer.Args) {
		const channel = await args.pickResult('textChannel');
		if (!channel.success) return this.errorFromArgument(args, channel.error);

		const commands = await args.repeatResult('command');
		if (!commands.success) return this.errorFromArgument(args, commands.error);

		return this.ok({ channel: channel.value.id, commands: commands.value.map((command) => command.name) });
	}

	public isValid(value: DisabledCommandChannel, { entry, guild }: SerializerUpdateContext): Awaited<boolean> {
		const channel = guild.channels.cache.get(value.channel);
		if (!channel) {
			throw new UserError({ identifier: LanguageKeys.Serializers.DisabledCommandChannels.ChannelDoesNotExist });
		}

		if (channel.type !== 'text') {
			throw new UserError({ identifier: LanguageKeys.Serializers.InvalidChannel, context: { name: entry.name } });
		}

		for (const command of value.commands) {
			if (!this.context.stores.get('commands').has(command)) {
				throw new UserError({ identifier: LanguageKeys.Serializers.DisabledCommandChannels.CommandDoesNotExist, context: { name: command } });
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
