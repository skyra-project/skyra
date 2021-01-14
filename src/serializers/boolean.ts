import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Awaited } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { AliasPieceOptions } from 'klasa';

@ApplyOptions<AliasPieceOptions>({
	aliases: ['bool']
})
export default class UserSerializer extends Serializer<boolean> {
	public parse(value: string, { t, entry }: SerializerUpdateContext) {
		const boolean = value.toLowerCase();
		if (t(LanguageKeys.Resolvers.BoolTrueOptions).includes(boolean)) return this.ok(true);
		if (t(LanguageKeys.Resolvers.BoolFalseOptions).includes(boolean)) return this.ok(false);
		return this.error(t(LanguageKeys.Resolvers.InvalidBool, { name: entry.name }));
	}

	public isValid(value: boolean): Awaited<boolean> {
		return typeof value === 'boolean';
	}

	public stringify(value: boolean, { t }: SerializerUpdateContext): string {
		return t(value ? LanguageKeys.Resolvers.BoolEnabled : LanguageKeys.Resolvers.BoolDisabled);
	}
}
