import { isNullishOrEmpty } from '@sapphire/utilities';

export function maybeParseNumber(value: string | bigint | null | undefined): number | null {
	if (isNullishOrEmpty(value)) return null;
	return Number(value);
}

export function maybeParseDate(value: string | null | undefined): number | null {
	if (isNullishOrEmpty(value)) return null;
	return Date.parse(value);
}
