import { Serializer } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { Awaitable } from '@sapphire/utilities';

export class UserSerializer extends Serializer<number> {
	public async parse(args: Serializer.Args, { entry }: Serializer.UpdateContext) {
		return this.result(args, await args.pickResult(entry.type as 'timespan', { minimum: entry.minimum, maximum: entry.maximum }));
	}

	public isValid(value: number, context: Serializer.UpdateContext): Awaitable<boolean> {
		if (typeof value === 'number' && Number.isInteger(value) && this.minOrMax(value, value, context)) return true;
		throw context.t(LanguageKeys.Serializers.InvalidInt, { name: context.entry.name });
	}

	public override stringify(data: number, { t }: Serializer.UpdateContext): string {
		return t(LanguageKeys.Globals.DurationValue, { value: data });
	}
}
