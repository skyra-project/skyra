import type { NonNullObject } from '@sapphire/utilities';

export interface JsonEncodable {
	toJSON(): NonNullObject;
}
