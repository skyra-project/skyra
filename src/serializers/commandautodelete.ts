import { CommandAutoDelete, Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { Awaited } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<CommandAutoDelete> {
	public parse(value: string, { t, entry }: SerializerUpdateContext) {
		const [command, rawDuration] = value.split(' ');
		if (!command) {
			return this.error(t(LanguageKeys.Resolvers.InvalidPiece, { name: entry.name, piece: 'command' }));
		}

		const duration = Number(rawDuration);
		if (!Number.isSafeInteger(duration) || duration < 0) {
			return this.error(t(LanguageKeys.Resolvers.InvalidDuration, { name: entry.name }));
		}

		return this.ok([command, duration] as const);
	}

	public isValid(value: CommandAutoDelete): Awaited<boolean> {
		return (
			Array.isArray(value) &&
			value.length === 2 &&
			typeof value[0] === 'string' &&
			typeof value[1] === 'number' &&
			this.context.client.commands.has(value[0])
		);
	}

	public stringify(value: CommandAutoDelete, { t }: SerializerUpdateContext): string {
		return `[${value[0]} -> ${t(LanguageKeys.Globals.DurationValue, { value: value[1] })}]`;
	}

	public equals(left: CommandAutoDelete, right: CommandAutoDelete): boolean {
		return left[0] === right[0];
	}
}
