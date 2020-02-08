import { isObject } from '@klasa/utils';
import { LanguageKeys } from '@lib/types/Languages';
import { createLanguageStore } from '@mocks/MockLanguageStore';
import English from '@root/languages/en-US';
import Spanish from '@root/languages/es-ES';
import { client } from '@testlib/MockInstances';

/**
 * Convert an object to a tuple.
 * @description Adopted from `@klasa/utils`'s `objecToTuples`, but without including values which will never match between languages
 * @param value The object to convert
 * @param prefix The prefix for the key
 */
function objectToTuples<T = Record<string, unknown>>(original: T, prefix = ''): string[] {
	const entries: string[] = [];
	for (const [key, value] of Object.entries(original)) {
		if (isObject(value)) {
			entries.push(...objectToTuples(value as Record<string, unknown>, `${prefix}${key}.`));
		} else {
			entries.push(`${prefix}${key}`);
		}
	}

	return entries;
}

describe('Language Testing', () => {
	const englishLanguageStore = createLanguageStore(client, 'english-store', English);
	const spanishLanguageStore = createLanguageStore(client, 'spanish-store', Spanish);

	const englishLanguageKeys = new English(englishLanguageStore, ['en-US.ts'], '').language as LanguageKeys;
	const spanishLanguageKeys = new Spanish(spanishLanguageStore, ['es-ES.ts'], '').language as LanguageKeys;

	test('Keys should be identical', () => {
		expect(objectToTuples(spanishLanguageKeys)).toStrictEqual(objectToTuples(englishLanguageKeys));
	});
});
