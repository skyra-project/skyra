import { Serializer, SerializerUpdateContext, TriggerIncludes } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Awaited, isObject } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<TriggerIncludes> {
	public parse(): Awaited<TriggerIncludes> {
		// TODO (kyranet): implement this
		throw new Error('Method not implemented.');
	}

	public isValid(data: TriggerIncludes, { language }: SerializerUpdateContext): Awaited<boolean> {
		if (
			isObject(data) &&
			Object.keys(data).length === 3 &&
			data.action === 'react' &&
			typeof data.input === 'string' &&
			typeof data.output === 'string'
		)
			return true;

		throw language.get(LanguageKeys.Serializers.TriggerIncludeInvalid);
	}

	public stringify(value: TriggerIncludes) {
		return `[${value.action} | ${value.input} -> ${value.output}]`;
	}
}
