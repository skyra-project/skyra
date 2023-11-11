import { isSerializedTwemoji } from '#utils/functions';
import { encodedBunnyTwemoji, serializedAnimatedSkyraGlasses, serializedStaticSkyra } from '../../../../mocks/constants.js';

describe('isSerializedTwemoji', () => {
	test('GIVEN encoded twemoji THEN returns true', () => {
		expect(isSerializedTwemoji(encodedBunnyTwemoji)).toBe(true);
	});

	test('GIVEN custom serialized static emoji THEN returns false', () => {
		expect(isSerializedTwemoji(serializedStaticSkyra)).toBe(false);
	});

	test('GIVEN custom serialized animated emoji THEN returns false', () => {
		expect(isSerializedTwemoji(serializedAnimatedSkyraGlasses)).toBe(false);
	});
});
