import { Serializer } from '#lib/database';
import type { Awaitable } from '@sapphire/utilities';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args) {
		return this.result(args, await args.pickResult('language'));
	}

	public isValid(value: string): Awaitable<boolean> {
		return this.container.i18n.languages.has(value);
	}
}
