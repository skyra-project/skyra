import { CommandAutoDelete, Serializer, SerializerUpdateContext } from '@lib/database';
import { Awaited } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<CommandAutoDelete> {
	public parse(value: string): Awaited<CommandAutoDelete> {
		const [command, rawDuration] = value.split(' ');
		if (!command) {
			throw new Error('Invalid command');
		}

		const duration = Number(rawDuration);
		if (!Number.isSafeInteger(duration) || duration < 0) {
			throw new Error('Invalid duration');
		}

		return [command, duration];
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
