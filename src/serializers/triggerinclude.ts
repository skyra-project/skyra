import { Serializer, SerializerUpdateContext, TriggerIncludes } from '#lib/database';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { resolveEmoji } from '#utils/util';
import { Awaited, isObject } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<TriggerIncludes> {
	public parse(value: string, { t, entry }: SerializerUpdateContext) {
		const values = value.split(' ');
		if (values.length !== 3) return this.error(t(LanguageKeys.Serializers.TriggerIncludeInvalid));

		const [action, input, output] = values;
		if (action !== 'react') return this.error(t(LanguageKeys.Serializers.TriggerIncludeInvalidAction));

		const resolved = resolveEmoji(output);
		if (resolved === null) return this.error(t(LanguageKeys.Resolvers.InvalidEmoji, { name: entry.name }));

		return this.ok({ action: action as 'react', input, output: resolved });
	}

	public isValid(data: TriggerIncludes, { t }: SerializerUpdateContext): Awaited<boolean> {
		if (
			isObject(data) &&
			Object.keys(data).length === 3 &&
			data.action === 'react' &&
			typeof data.input === 'string' &&
			typeof data.output === 'string'
		)
			return true;

		throw t(LanguageKeys.Serializers.TriggerIncludeInvalid);
	}

	public equals(left: TriggerIncludes, right: TriggerIncludes): boolean {
		return left.input === right.input;
	}

	public stringify(value: TriggerIncludes) {
		return `[${value.action} | ${value.input} -> ${value.output}]`;
	}
}
