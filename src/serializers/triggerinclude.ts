import { Serializer, SerializerUpdateContext, TriggerIncludes } from '#lib/database/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { resolveEmoji } from '#utils/util';
import { Awaited, isObject } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<TriggerIncludes> {
	public parse(value: string, context: SerializerUpdateContext) {
		const values = value.split(' ');
		if (values.length !== 3) return this.error(context.language.get(LanguageKeys.Serializers.TriggerIncludeInvalid));

		const [action, input, output] = values;
		if (action !== 'react') return this.error(context.language.get(LanguageKeys.Serializers.TriggerIncludeInvalidAction));

		const resolved = resolveEmoji(output);
		if (resolved === null) return this.error(context.language.get(LanguageKeys.Resolvers.InvalidEmoji, { name: context.entry.name }));

		return this.ok({ action: action as 'react', input, output: resolved });
	}

	public isValid(data: TriggerIncludes, { language }: SerializerUpdateContext): Awaited<boolean> {
		if (
			isObject(data) &&
			Object.keys(data).length === 3 &&
			data.action === 'react' &&
			typeof data.input === 'string' &&
			typeof data.output === 'string'
		)
			return true;

		throw language.get(LanguageKeys.Serializers.TriggerIncludeInvalid);
	}

	public equals(left: TriggerIncludes, right: TriggerIncludes): boolean {
		return left.input === right.input;
	}

	public stringify(value: TriggerIncludes) {
		return `[${value.action} | ${value.input} -> ${value.output}]`;
	}
}
