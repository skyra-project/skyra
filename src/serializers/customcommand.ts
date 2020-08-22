import type { CustomCommand } from '@lib/types/settings/GuildSettings';
import { ZeroWidhSpace } from '@utils/constants';
import { Serializer, SerializerUpdateContext } from 'klasa';

export default class extends Serializer {
	public validate(data: CustomCommand, { language }: SerializerUpdateContext) {
		if (
			typeof data.id === 'string' &&
			typeof data.embed === 'boolean' &&
			typeof data.color === 'number' &&
			typeof data.content === 'string' &&
			Array.isArray(data.args) &&
			data.args.every((arg) => typeof arg === 'string')
		) {
			if (data.id.length > 50) throw language.get('commandTagNameTooLong');
			if (data.id.includes('`') || data.id.includes(ZeroWidhSpace)) throw language.get('commandTagNameNotAllowed');
			return data;
		}

		throw language.get('serializerCustomCommandInvalid');
	}

	public stringify(value: CustomCommand) {
		return value.id;
	}
}
