import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { Awaited } from '@sapphire/utilities';

export class UserSerializer extends Serializer<number> {
	public async parse(args: Serializer.Args, { entry }: SerializerUpdateContext) {
		return this.result(args, await args.pickResult(entry.type as 'timespan'));
	}

	public isValid(value: number, context: SerializerUpdateContext): Awaited<boolean> {
		if (typeof value === 'number' && Number.isInteger(value) && this.minOrMax(value, value, context)) return true;
		throw context.t(LanguageKeys.Serializers.InvalidInt, { name: context.entry.name });
	}
}
