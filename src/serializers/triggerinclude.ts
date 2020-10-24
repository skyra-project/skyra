import { Serializer, SerializerUpdateContext } from '@lib/database';
import { TriggerIncludes } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { isObject } from '@sapphire/utilities';

export default class extends Serializer {
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
