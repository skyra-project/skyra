import { Serializer } from '#lib/database';
import type { Awaited } from '@sapphire/utilities';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args) {
		return this.result(args, await args.pickResult('language'));
	}

	public isValid(value: string): Awaited<boolean> {
		return this.context.client.i18n.languages.has(value);
	}
}
