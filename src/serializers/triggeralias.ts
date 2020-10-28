import { Serializer, SerializerUpdateContext, TriggerAlias } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { isObject } from '@sapphire/utilities';

export default class UserSerializer extends Serializer {
	public validate(data: TriggerAlias, { language }: SerializerUpdateContext) {
		if (isObject(data) && Object.keys(data).length === 2 && typeof data.input === 'string' && typeof data.output === 'string') return data;

		throw language.get(LanguageKeys.Serializers.TriggerAliasInvalid);
	}

	public stringify(value: TriggerAlias) {
		return `[${value.input} -> ${value.output}]`;
	}
}
