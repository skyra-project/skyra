import { isObject } from '@klasa/utils';
import { TriggerIncludes } from '@lib/types/settings/GuildSettings';
import { Serializer, SerializerUpdateContext } from 'klasa';

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

		throw language.tget('SERIALIZER_TRIGGER_INCLUDE_INVALID');
	}

	public stringify(value: TriggerIncludes) {
		return `[${value.action} | ${value.input} -> ${value.output}]`;
	}
}
