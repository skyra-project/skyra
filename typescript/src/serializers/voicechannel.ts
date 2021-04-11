import { Serializer, SerializerUpdateContext } from '#lib/database';
import type { Awaited } from '@sapphire/utilities';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args) {
		const result = await args.pickResult('voiceChannel');
		return result.success ? this.ok(result.value.id) : this.errorFromArgument(args, result.error);
	}

	public isValid(value: string, context: SerializerUpdateContext): Awaited<boolean> {
		return context.guild.channels.cache.has(value);
	}

	public stringify(value: string, context: SerializerUpdateContext): string {
		return context.guild.channels.cache.get(value)?.name ?? value;
	}
}
