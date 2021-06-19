import { Serializer, SerializerUpdateContext, TriggerAlias } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Awaited, isObject } from '@sapphire/utilities';

export class UserSerializer extends Serializer<TriggerAlias> {
	public async parse(args: Serializer.Args) {
		const input = await args.pickResult('string');
		if (!input.success) return this.errorFromArgument(args, input.error);

		const output = await args.pickResult('command');
		if (!output.success) return this.errorFromArgument(args, output.error);

		return this.ok({ input: input.value, output: output.value.name });
	}

	public isValid(value: TriggerAlias, { t }: SerializerUpdateContext): Awaited<boolean> {
		if (isObject(value) && Object.keys(value).length === 2 && typeof value.input === 'string' && typeof value.output === 'string') return true;

		throw t(LanguageKeys.Serializers.TriggerAliasInvalid);
	}

	public equals(left: TriggerAlias, right: TriggerAlias): boolean {
		return left.input === right.input;
	}

	public stringify(value: TriggerAlias) {
		return `[${value.input} -> ${value.output}]`;
	}
}
