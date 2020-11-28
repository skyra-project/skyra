import { Serializer, SerializerUpdateContext, TriggerAlias } from '#lib/database';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Awaited, isObject } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<TriggerAlias> {
	public parse(value: string, context: SerializerUpdateContext) {
		const values = value.split(' ');
		if (values.length === 2) return this.ok({ input: values[0], output: values[1] });
		return this.error(context.language.get(LanguageKeys.Serializers.TriggerAliasInvalid));
	}

	public isValid(value: TriggerAlias, context: SerializerUpdateContext): Awaited<boolean> {
		if (isObject(value) && Object.keys(value).length === 2 && typeof value.input === 'string' && typeof value.output === 'string') return true;

		throw context.language.get(LanguageKeys.Serializers.TriggerAliasInvalid);
	}

	public equals(left: TriggerAlias, right: TriggerAlias): boolean {
		return left.input === right.input;
	}

	public stringify(value: TriggerAlias) {
		return `[${value.input} -> ${value.output}]`;
	}
}
