import { Serializer } from '#lib/database';
import type { Awaitable } from '@sapphire/utilities';

export class UserSerializer extends Serializer<number> {
	public parse() {
		return this.error('Not allowed');
	}

	public isValid(): Awaitable<boolean> {
		return false;
	}
}
