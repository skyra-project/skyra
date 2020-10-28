import { CustomCommand, Serializer, SerializerUpdateContext } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ZeroWidthSpace } from '@utils/constants';

export default class extends Serializer<CustomCommand> {
	public parse(): CustomCommand | Promise<CustomCommand> {
		throw new Error('Method not implemented.');
	}

	public isValid(value: CustomCommand, context: SerializerUpdateContext): boolean {
		if (typeof value.id !== 'string') {
			throw new Error('The property "id" must be a string.');
		}

		if (value.id.length > 50) {
			throw context.language.get(LanguageKeys.Commands.Tags.TagNameTooLong);
		}

		if (value.id.includes('`') || value.id.includes(ZeroWidthSpace)) {
			throw context.language.get(LanguageKeys.Commands.Tags.TagNameNotAllowed);
		}

		if (typeof value.embed !== 'boolean') {
			throw new Error('The property "embed" must be a boolean.');
		}

		if (typeof value.color !== 'number') {
			throw new Error('The property "color" must be a number.');
		}

		if (typeof value.content !== 'string') {
			throw new Error('The property "content" must be a string.');
		}

		if (!Array.isArray(value.args) || value.args.some((arg) => typeof arg !== 'string')) {
			throw new Error('The property "args" must be an array of strings.');
		}

		return true;
	}

	public stringify(value: CustomCommand) {
		return value.id;
	}
}
