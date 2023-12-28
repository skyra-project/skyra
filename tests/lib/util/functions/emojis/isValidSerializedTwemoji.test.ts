import { isValidSerializedTwemoji } from '#utils/functions';
import { encodedBunnyTwemoji, serializedAnimatedSkyraGlasses, serializedStaticSkyra } from '../../../../mocks/constants.js';

describe('isValidSerializedTwemoji', () => {
	test('GIVEN encoded twemoji THEN returns true', () => {
		expect(isValidSerializedTwemoji(encodedBunnyTwemoji)).toBe(true);
	});

	test('GIVEN custom serialized static emoji THEN returns false', () => {
		expect(isValidSerializedTwemoji(serializedStaticSkyra)).toBe(false);
	});

	test('GIVEN custom serialized animated emoji THEN returns false', () => {
		expect(isValidSerializedTwemoji(serializedAnimatedSkyraGlasses)).toBe(false);
	});
});
