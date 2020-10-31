import { Serializer, SerializerUpdateContext } from '@lib/database';
import { Awaited } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<string> {
	public parse(value: string, context: SerializerUpdateContext): Awaited<string> {
		Serializer.minOrMax(value.length, context);
		return value;
	}

	public isValid(value: string, context: SerializerUpdateContext): Awaited<boolean> {
		return Serializer.minOrMax(value.length, context);
	}
}
