import type { CustomCommand } from '@lib/types/settings/GuildSettings';
import { Serializer, SerializerUpdateContext } from 'klasa';

export default class extends Serializer {

	public validate(data: CustomCommand, { language }: SerializerUpdateContext) {
		if (typeof data.id === 'string'
			&& typeof data.embed === 'boolean'
			&& typeof data.color === 'number'
			&& typeof data.content === 'string'
			&& Array.isArray(data.args) && data.args.every(arg => typeof arg === 'string')) {
			if (data.id.length > 50) throw language.tget('COMMAND_TAG_NAME_TOOLONG');
			if (data.id.includes('`') || data.id.includes('\u200B')) throw language.tget('COMMAND_TAG_NAME_NOTALLOWED');
			return data;
		}

		throw language.tget('SERIALIZER_CUSTOM_COMMAND_INVALID');
	}

	public stringify(value: CustomCommand) {
		return value.id;
	}

}
