import { CustomCommand, Serializer, SerializerUpdateContext } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Awaited } from '@sapphire/utilities';
import { ZeroWidthSpace } from '@utils/constants';

export default class UserSerializer extends Serializer<CustomCommand> {
	public parse() {
		// TODO (kyranet): implement this
		return this.error('Method not implemented.');
	}

	public isValid(value: CustomCommand, context: SerializerUpdateContext): Awaited<boolean> {
		if (typeof value.id !== 'string') {
			throw new Error(context.language.get(LanguageKeys.Serializers.CustomCommands.InvalidId));
		}

		if (value.id.length > 50) {
			throw context.language.get(LanguageKeys.Commands.Tags.TagNameTooLong);
		}

		if (value.id.includes('`') || value.id.includes(ZeroWidthSpace)) {
			throw context.language.get(LanguageKeys.Commands.Tags.TagNameNotAllowed);
		}

		if (typeof value.embed !== 'boolean') {
			throw new Error(context.language.get(LanguageKeys.Serializers.CustomCommands.InvalidEmbed));
		}

		if (typeof value.color !== 'number') {
			throw new Error(context.language.get(LanguageKeys.Serializers.CustomCommands.InvalidColor));
		}

		if (typeof value.content !== 'string') {
			throw new Error(context.language.get(LanguageKeys.Serializers.CustomCommands.InvalidContent));
		}

		if (!Array.isArray(value.args) || value.args.some((arg) => typeof arg !== 'string')) {
			throw new Error(context.language.get(LanguageKeys.Serializers.CustomCommands.InvalidArgs));
		}

		return true;
	}

	public stringify(value: CustomCommand): string {
		return value.id;
	}

	public equals(left: CustomCommand, right: CustomCommand): boolean {
		return left.id === right.id;
	}
}
