import { CommandAutoDelete, Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Awaited } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<CommandAutoDelete> {
	public parse(value: string, context: SerializerUpdateContext) {
		const [command, rawDuration] = value.split(' ');
		if (!command) {
			return this.error(context.language.get(LanguageKeys.Resolvers.InvalidPiece, { name: context.entry.name, piece: 'command' }));
		}

		const duration = Number(rawDuration);
		if (!Number.isSafeInteger(duration) || duration < 0) {
			return this.error(context.language.get(LanguageKeys.Resolvers.InvalidDuration, { name: context.entry.name }));
		}

		return this.ok([command, duration] as const);
	}

	public isValid(value: CommandAutoDelete): Awaited<boolean> {
		return (
			Array.isArray(value) &&
			value.length === 2 &&
			typeof value[0] === 'string' &&
			typeof value[1] === 'number' &&
			this.client.commands.has(value[0])
		);
	}

	public stringify(value: CommandAutoDelete, context: SerializerUpdateContext): string {
		return `[${value[0]} -> ${context.language.duration(value[1], 2)}]`;
	}

	public equals(left: CommandAutoDelete, right: CommandAutoDelete): boolean {
		return left[0] === right[0];
	}
}
