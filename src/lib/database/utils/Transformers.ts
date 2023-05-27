import { isNullish } from '@sapphire/utilities';
import type { ValueTransformer } from 'typeorm';

export const kBigIntTransformer: ValueTransformer = {
	from: (value) => (isNullish(value) ? value : Number(value as string)),
	to: (value) => (isNullish(value) ? value : String(value as number))
};
