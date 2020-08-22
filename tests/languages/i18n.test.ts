import { client } from '@mocks/MockInstances';
import { createLanguageStore } from '@mocks/MockLanguageStore';
import English from '@root/languages/en-US';
import Spanish from '@root/languages/es-ES';
import { isObject } from '@sapphire/utilities';

/**
 * Convert an object to a tuple.
 * @description Adopted from `@sapphire/utilities`'s `objectToTuples`, but without including values which will never match between languages
 * @param original The object to convert
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

describe('i18n tests', () => {
	const englishLanguageStore = createLanguageStore(client, 'english-store', English);
	const spanishLanguageStore = createLanguageStore(client, 'spanish-store', Spanish);

	const english = new English(englishLanguageStore, ['en-US.ts'], '');
	const spanish = new Spanish(spanishLanguageStore, ['es-ES.ts'], '');

	describe('Tuple based comparison testing', () => {
		test('GIVEN language files THEN should have identical language keys', () => {
			const englishTuple = objectToTuples(english.language);
			const spanishTuple = objectToTuples(spanish.language);

			expect(spanishTuple).toStrictEqual(englishTuple);
		});

		test('GIVEN language files THEN should have identical permission nodes', () => {
			const englishTuple = objectToTuples(english.PERMISSIONS);
			const spanishTuple = objectToTuples(spanish.PERMISSIONS);

			expect(spanishTuple).toStrictEqual(englishTuple);
		});
	});

	describe('English language testing', () => {
		test('GIVEN English Language THEN should parse all ordinals', () => {
			expect(english.ordinal(0)).toBe('0th');
			expect(english.ordinal(1)).toBe('1st');
			expect(english.ordinal(2)).toBe('2nd');
			expect(english.ordinal(3)).toBe('3rd');
			expect(english.ordinal(4)).toBe('4th');
			expect(english.ordinal(5)).toBe('5th');
			expect(english.ordinal(10)).toBe('10th');
		});

		test('GIVEN English language THEN should have noop init', async () => {
			const spy = jest.spyOn(english, 'init');

			await english.init();

			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy).toHaveBeenCalledWith();

			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			expect(english.init()).resolves.toBe(undefined);

			expect(spy).toHaveBeenCalledTimes(2);
		});
	});

	describe('Spanish language testing', () => {
		test('GIVEN Spanish Language THEN should parse all ordinals', () => {
			expect(spanish.ordinal(0)).toBe('0mo');
			expect(spanish.ordinal(1)).toBe('1ro');
			expect(spanish.ordinal(2)).toBe('2do');
			expect(spanish.ordinal(3)).toBe('3ro');
			expect(spanish.ordinal(4)).toBe('4to');
			expect(spanish.ordinal(5)).toBe('5to');
			expect(spanish.ordinal(6)).toBe('6to');
			expect(spanish.ordinal(7)).toBe('7mo');
			expect(spanish.ordinal(8)).toBe('8vo');
			expect(spanish.ordinal(9)).toBe('9no');
			expect(spanish.ordinal(10)).toBe('10mo');
		});

		test('GIVEN Spanish language THEN should have noop init', async () => {
			const spy = jest.spyOn(spanish, 'init');

			await spanish.init();

			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy).toHaveBeenCalledWith();

			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			expect(spanish.init()).resolves.toBe(undefined);

			expect(spy).toHaveBeenCalledTimes(2);
		});
	});
});
