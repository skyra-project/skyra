import { Serializer, SerializerUpdateContext } from 'klasa';
import { RolesAuto } from '@lib/types/settings/GuildSettings';
import { isObject } from '@klasa/utils';

export default class extends Serializer {

	public validate(data: RolesAuto, { language }: SerializerUpdateContext) {
		if (isObject(data)
			&& Object.keys(data).length === 2
			&& typeof data.id === 'string'
			&& typeof data.points === 'number') return data;

		throw language.tget('SERIALIZER_AUTOROLE_INVALID');
	}

	public stringify(value: RolesAuto) {
		return `[${value.id} -> ${value.points.toLocaleString()}]`;
	}

}
