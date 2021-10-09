import { GuildEntity, GuildSettings, Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { IncomingType, OutgoingType } from '#lib/moderation/workers';
import type { Awaitable } from '@sapphire/utilities';
import { remove as removeConfusables } from 'confusables';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args, { t, entry, entity }: SerializerUpdateContext) {
		const result = await args.restResult('string', { minimum: entry.minimum, maximum: entry.maximum });
		if (!result.success) return this.result(args, result);

		const word = removeConfusables(result.value.toLowerCase());
		if (await this.hasWord(entity, word)) return this.error(t(LanguageKeys.Serializers.WordIncluded, { name: entry.name, value: word }));
		return this.ok(word);
	}

	public isValid(value: string, context: SerializerUpdateContext): Awaitable<boolean> {
		const word = removeConfusables(value.toLowerCase());
		return value === word && this.minOrMax(value, value.length, context).success;
	}

	private async hasWord(settings: GuildEntity, content: string) {
		const words = settings[GuildSettings.Selfmod.Filter.Raw];
		if (words.includes(content)) return true;

		const regExp = settings.wordFilterRegExp;
		if (regExp === null) return false;

		try {
			const result = await this.container.workers.send({ type: IncomingType.RunRegExp, content, regExp });
			return result.type === OutgoingType.RegExpMatch;
		} catch {
			return false;
		}
	}
}
