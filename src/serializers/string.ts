import { Serializer, SerializerUpdateContext } from '#lib/database';
import type { Awaited } from '@sapphire/utilities';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args, { entry }: SerializerUpdateContext) {
		return this.result(args, await args.pickResult('string', { minimum: entry.minimum, maximum: entry.maximum }));
	}

	public isValid(value: string, context: SerializerUpdateContext): Awaited<boolean> {
		return this.minOrMax(value, value.length, context).success;
	}
}
