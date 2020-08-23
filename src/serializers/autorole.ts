import { RolesAuto } from '@lib/types/settings/GuildSettings';
import { isObject } from '@sapphire/utilities';
import { Serializer, SerializerUpdateContext } from 'klasa';

export default class extends Serializer {
	public validate(data: RolesAuto, { language }: SerializerUpdateContext) {
		if (isObject(data) && Object.keys(data).length === 2 && typeof data.id === 'string' && typeof data.points === 'number') return data;

		throw language.get('serializerAutoRoleInvalid');
	}

	public stringify(value: RolesAuto) {
		return `[${value.id} -> ${value.points.toLocaleString()}]`;
	}
}
