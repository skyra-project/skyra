import { isObject } from '@klasa/utils';
import { RolesAuto } from '@lib/types/settings/GuildSettings';
import { Serializer, SerializerUpdateContext } from 'klasa';

export default class extends Serializer {
	public validate(data: RolesAuto, { language }: SerializerUpdateContext) {
		if (isObject(data) && Object.keys(data).length === 2 && typeof data.id === 'string' && typeof data.points === 'number') return data;

		throw language.get('SERIALIZER_AUTOROLE_INVALID');
	}

	public stringify(value: RolesAuto) {
		return `[${value.id} -> ${value.points.toLocaleString()}]`;
	}
}
