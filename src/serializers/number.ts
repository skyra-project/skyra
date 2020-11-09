import { Serializer, SerializerUpdateContext } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Awaited } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { AliasPieceOptions } from 'klasa';

@ApplyOptions<AliasPieceOptions>({
	aliases: ['integer', 'float']
})
export default class UserSerializer extends Serializer<number> {
	public parse(value: string, context: SerializerUpdateContext): Awaited<number> {
		switch (context.entry.type) {
			case 'integer': {
				const number = parseInt(value, 10);
				if (Number.isInteger(number) && Serializer.minOrMax(number, context)) return number;
				throw context.language.get(LanguageKeys.Resolvers.InvalidInt, { name: context.entry.name });
			}
			case 'number':
			case 'float': {
				const number = parseFloat(value);
				if (!Number.isNaN(number) && Serializer.minOrMax(number, context)) return number;
				throw context.language.get(LanguageKeys.Resolvers.InvalidFloat, { name: context.entry.name });
			}
		}

		throw new Error('Unreachable');
	}

	public isValid(value: number, context: SerializerUpdateContext): Awaited<boolean> {
		switch (context.entry.type) {
			case 'integer': {
				if (typeof value === 'number' && Number.isInteger(value) && Serializer.minOrMax(value, context)) return true;
				throw context.language.get(LanguageKeys.Resolvers.InvalidInt, { name: context.entry.name });
			}
			case 'number':
			case 'float': {
				if (typeof value === 'number' && !Number.isNaN(value) && Serializer.minOrMax(value, context)) return true;
				throw context.language.get(LanguageKeys.Resolvers.InvalidFloat, { name: context.entry.name });
			}
		}

		throw new Error('Unreachable');
	}
}
