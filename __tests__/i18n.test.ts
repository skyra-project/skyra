import { LanguageKeys } from '@lib/types/Languages';
import { createLanguageStore } from '@mocks/MockLanguageStore';
import English from '@root/languages/en-US';
import Spanish from '@root/languages/es-ES';
import { client } from '@testlib/MockInstances';

/**
 * Voodoo magic function that flattens an object, no matter the amount of deep-level children a key has into an array
 * So it can be tested for strict equality and order of keys.
 * Taken from Stackoverflow
 * @param obj Object to deep reduce to keys
 * @param prefix Prefix to apply to each entry
 */
const i18nReducer = (obj: any, prefix = ''): any => Object.keys(obj).reduce((res: string | any[], el: string) => {
	if (Array.isArray(obj[el])) {
		return res;
	} else if (typeof obj[el] === 'object' && obj[el] !== null) {
		return [...res, ...i18nReducer(obj[el], `${prefix}${el}.`)];
	}
	return [...res, prefix + el];
}, []);

describe('Language Testing', () => {
	const englishLanguageStore = createLanguageStore(client, 'english-store', English);
	const spanishLanguageStore = createLanguageStore(client, 'spanish-store', Spanish);

	const englishLanguageKeys = new English(englishLanguageStore, ['en-US.ts'], '').language as LanguageKeys;
	const spanishLanguageKeys = new Spanish(spanishLanguageStore, ['es-ES.ts'], '').language as LanguageKeys;


	test('Keys should be identical', () => {
		expect(i18nReducer(spanishLanguageKeys)).toStrictEqual(i18nReducer(englishLanguageKeys));
	});
});
