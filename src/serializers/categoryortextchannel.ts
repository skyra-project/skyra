import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { isCategoryChannel, isTextChannel } from '@sapphire/discord.js-utilities';
import type { Awaitable } from '@sapphire/utilities';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args, { t, entry }: SerializerUpdateContext) {
		const result = await args.pickResult('guildChannel');
		if (!result.success) {
			return this.errorFromArgument(args, result.error);
		}

		if (isTextChannel(result.value) || isCategoryChannel(result.value)) {
			return this.ok(result.value.id);
		}

		return this.error(t(LanguageKeys.Serializers.InvalidChannel, { name: entry.name }));
	}

	public isValid(value: string, context: SerializerUpdateContext): Awaitable<boolean> {
		return context.guild.channels.cache.has(value);
	}

	public stringify(value: string, context: SerializerUpdateContext): string {
		return context.guild.channels.cache.get(value)?.name ?? value;
	}
}
