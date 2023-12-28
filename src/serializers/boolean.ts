import { Serializer } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@sapphire/decorators';
import type { Awaitable } from '@sapphire/utilities';

@ApplyOptions<Serializer.Options>({
	aliases: ['bool']
})
export class UserSerializer extends Serializer<boolean> {
	public async parse(args: Serializer.Args) {
		return this.result(args, await args.pickResult('boolean'));
	}

	public isValid(value: boolean): Awaitable<boolean> {
		return typeof value === 'boolean';
	}

	public override stringify(value: boolean, { t }: Serializer.UpdateContext): string {
		return t(value ? LanguageKeys.Arguments.BooleanEnabled : LanguageKeys.Arguments.BooleanDisabled);
	}
}
