import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@sapphire/decorators';
import type { Awaited } from '@sapphire/utilities';

@ApplyOptions<Serializer.Options>({
	aliases: ['integer', 'float']
})
export class UserSerializer extends Serializer<number> {
	public parse(value: Serializer.Args, { entry }: SerializerUpdateContext) {
		return value.pickResult(entry.type as 'integer' | 'number' | 'float');
	}

	public isValid(value: number, context: SerializerUpdateContext): Awaited<boolean> {
		switch (context.entry.type) {
			case 'integer': {
				if (typeof value === 'number' && Number.isInteger(value) && this.minOrMax(value, value, context)) return true;
				throw context.t(LanguageKeys.Serializers.InvalidInt, { name: context.entry.name });
			}
			case 'number':
			case 'float': {
				if (typeof value === 'number' && !Number.isNaN(value) && this.minOrMax(value, value, context)) return true;
				throw context.t(LanguageKeys.Serializers.InvalidFloat, { name: context.entry.name });
			}
		}

		throw new Error('Unreachable');
	}
}
