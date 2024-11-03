import { Serializer } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@sapphire/decorators';
import type { Awaitable } from '@sapphire/utilities';

@ApplyOptions<Serializer.Options>({
	aliases: ['integer', 'float']
})
export class UserSerializer extends Serializer<number> {
	public async parse(args: Serializer.Args, { entry }: Serializer.UpdateContext) {
		return this.result(args, await args.pickResult(entry.type as SerializerType));
	}

	public isValid(value: number, context: Serializer.UpdateContext): Awaitable<boolean> {
		switch (context.entry.type as SerializerType) {
			case 'integer': {
				if (typeof value === 'number' && Number.isInteger(value) && this.minOrMax(value, value, context)) return true;
				throw context.t(LanguageKeys.Serializers.InvalidInt, { name: context.entry.name });
			}
			case 'number':
			case 'float': {
				if (typeof value === 'number' && !Number.isNaN(value) && this.minOrMax(value, value, context)) return true;
				throw context.t(LanguageKeys.Serializers.InvalidFloat, { name: context.entry.name });
			}
			default: {
				throw new Error('Unreachable');
			}
		}
	}
}

type SerializerType = 'integer' | 'number' | 'float';
