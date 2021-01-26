import { Serializer } from '#lib/database';
import type { Awaited } from '@sapphire/utilities';

export class UserSerializer extends Serializer<string> {
	public parse(args: Serializer.Args) {
		return args.pickResult('language');
	}

	public isValid(value: string): Awaited<boolean> {
		return this.context.client.i18n.languages.has(value);
	}
}
