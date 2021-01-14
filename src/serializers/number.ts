import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Awaited } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { AliasPieceOptions } from 'klasa';

@ApplyOptions<AliasPieceOptions>({
	aliases: ['integer', 'float']
})
export default class UserSerializer extends Serializer<number> {
	public parse(value: string, context: SerializerUpdateContext) {
		switch (context.entry.type) {
			case 'integer': {
				const number = parseInt(value, 10);
				if (Number.isInteger(number)) return this.minOrMax(number, number, context);
				return this.error(context.t(LanguageKeys.Resolvers.InvalidInt, { name: context.entry.name }));
			}
			case 'number':
			case 'float': {
				const number = parseFloat(value);
				if (!Number.isNaN(number)) return this.minOrMax(number, number, context);
				return this.error(context.t(LanguageKeys.Resolvers.InvalidFloat, { name: context.entry.name }));
			}
		}

		throw new Error('Unreachable');
	}

	public isValid(value: number, context: SerializerUpdateContext): Awaited<boolean> {
		switch (context.entry.type) {
			case 'integer': {
				if (typeof value === 'number' && Number.isInteger(value) && this.minOrMax(value, value, context)) return true;
				throw context.t(LanguageKeys.Resolvers.InvalidInt, { name: context.entry.name });
			}
			case 'number':
			case 'float': {
				if (typeof value === 'number' && !Number.isNaN(value) && this.minOrMax(value, value, context)) return true;
				throw context.t(LanguageKeys.Resolvers.InvalidFloat, { name: context.entry.name });
			}
		}

		throw new Error('Unreachable');
	}
}
