import { Serializer } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { isCategoryChannel, isTextChannel } from '@sapphire/discord.js-utilities';
import type { Awaitable } from '@sapphire/utilities';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args, { t, entry }: Serializer.UpdateContext) {
		const result = await args.pickResult('guildChannel');
		if (result.isErr()) {
			return this.errorFromArgument(args, result.unwrapErr());
		}

		const channel = result.unwrap();
		if (isTextChannel(channel) || isCategoryChannel(channel)) {
			return this.ok(channel.id);
		}

		return this.error(t(LanguageKeys.Serializers.InvalidChannel, { name: entry.name }));
	}

	public isValid(value: string, context: Serializer.UpdateContext): Awaitable<boolean> {
		return context.guild.channels.cache.has(value);
	}

	public override stringify(value: string, context: Serializer.UpdateContext): string {
		return context.guild.channels.cache.get(value)?.name ?? value;
	}
}
