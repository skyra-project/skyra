import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Awaited } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { AliasPieceOptions } from 'klasa';

@ApplyOptions<AliasPieceOptions>({
	aliases: ['bool']
})
export default class UserSerializer extends Serializer<boolean> {
	public parse(value: string, context: SerializerUpdateContext) {
		const boolean = value.toLowerCase();
		if (context.language.get(LanguageKeys.Resolvers.BoolTrueOptions).includes(boolean)) return this.ok(true);
		if (context.language.get(LanguageKeys.Resolvers.BoolFalseOptions).includes(boolean)) return this.ok(false);
		return this.error(context.language.get(LanguageKeys.Resolvers.InvalidBool, { name: context.entry.name }));
	}

	public isValid(value: boolean): Awaited<boolean> {
		return typeof value === 'boolean';
	}

	public stringify(value: boolean, context: SerializerUpdateContext): string {
		return context.language.get(value ? LanguageKeys.Resolvers.BoolEnabled : LanguageKeys.Resolvers.BoolDisabled);
	}
}
