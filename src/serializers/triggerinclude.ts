import { Serializer, SerializerUpdateContext, TriggerIncludes } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { isObject } from '@sapphire/utilities';

export default class UserSerializer extends Serializer {
	public validate(data: TriggerIncludes, { language }: SerializerUpdateContext) {
		if (
			isObject(data) &&
			Object.keys(data).length === 3 &&
			data.action === 'react' &&
			typeof data.input === 'string' &&
			typeof data.output === 'string'
		)
			return data;

		throw language.get(LanguageKeys.Serializers.TriggerIncludeInvalid);
	}

	public stringify(value: TriggerIncludes) {
		return `[${value.action} | ${value.input} -> ${value.output}]`;
	}
}
