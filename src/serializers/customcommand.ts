import type { CustomCommand } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ZeroWidthSpace } from '@utils/constants';
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
			if (data.id.length > 50) throw language.get(LanguageKeys.Commands.Tags.TagNameTooLong);
			if (data.id.includes('`') || data.id.includes(ZeroWidthSpace)) throw language.get(LanguageKeys.Commands.Tags.TagNameNotAllowed);
			return data;
		}

		throw language.get(LanguageKeys.Serializers.CustomCommandInvalid);
	}

	public stringify(value: CustomCommand) {
		return value.id;
	}
}
