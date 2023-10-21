import { Serializer } from '#lib/database';
import type { Awaitable } from '@sapphire/utilities';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args) {
		const result = await args.pickResult('guildVoiceChannel');
		return result.match({
			ok: (value) => this.ok(value.id),
			err: (error) => this.errorFromArgument(args, error)
		});
	}

	public isValid(value: string, context: Serializer.UpdateContext): Awaitable<boolean> {
		return context.guild.channels.cache.has(value);
	}

	public override stringify(value: string, context: Serializer.UpdateContext): string {
		return context.guild.channels.cache.get(value)?.name ?? value;
	}
}
