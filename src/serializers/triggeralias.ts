import { isObject } from '@klasa/utils';
import { TriggerAlias } from '@lib/types/settings/GuildSettings';
import { Serializer, SerializerUpdateContext } from 'klasa';

export default class extends Serializer {
	public validate(data: TriggerAlias, { language }: SerializerUpdateContext) {
		if (isObject(data) && Object.keys(data).length === 2 && typeof data.input === 'string' && typeof data.output === 'string') return data;

		throw language.tget('SERIALIZER_TRIGGER_ALIAS_INVALID');
	}

	public stringify(value: TriggerAlias) {
		return `[${value.input} -> ${value.output}]`;
	}
}
