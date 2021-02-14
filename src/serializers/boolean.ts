import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@sapphire/decorators';
import type { Awaited } from '@sapphire/utilities';

@ApplyOptions<Serializer.Options>({
	aliases: ['bool']
})
export class UserSerializer extends Serializer<boolean> {
	public async parse(args: Serializer.Args) {
		return this.result(args, await args.pickResult('boolean'));
	}

	public isValid(value: boolean): Awaited<boolean> {
		return typeof value === 'boolean';
	}

	public stringify(value: boolean, { t }: SerializerUpdateContext): string {
		return t(value ? LanguageKeys.Arguments.BoolEnabled : LanguageKeys.Arguments.BoolDisabled);
	}
}
