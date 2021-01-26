import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { Awaited } from '@sapphire/utilities';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args, { t, entry }: SerializerUpdateContext) {
		const result = await args.pickResult('guildChannel');
		if (!result.success) {
			return this.error(t(LanguageKeys.Serializers.InvalidChannel, { name: entry.name }));
		}

		if (result.value.type === 'text' || result.value.type === 'category') {
			return this.ok(result.value.id);
		}

		return this.error(t(LanguageKeys.Serializers.InvalidChannel, { name: entry.name }));
	}

	public isValid(value: string, context: SerializerUpdateContext): Awaited<boolean> {
		return context.guild.channels.cache.has(value);
	}

	public stringify(value: string, context: SerializerUpdateContext): string {
		return context.guild.channels.cache.get(value)?.name ?? value;
	}
}
