import { Serializer, SerializerUpdateContext, TriggerAlias } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Awaited, isObject } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<TriggerAlias> {
	public parse() {
		// TODO (kyranet): implement this
		return this.error('Method not implemented.');
	}

	public isValid(value: TriggerAlias, context: SerializerUpdateContext): Awaited<boolean> {
		if (isObject(value) && Object.keys(value).length === 2 && typeof value.input === 'string' && typeof value.output === 'string') return true;

		throw context.language.get(LanguageKeys.Serializers.TriggerAliasInvalid);
	}

	public stringify(value: TriggerAlias) {
		return `[${value.input} -> ${value.output}]`;
	}
}
