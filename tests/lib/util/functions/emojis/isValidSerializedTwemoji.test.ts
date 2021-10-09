import { encodedBunnyTwemoji, serializedAnimatedSkyraGlasses, serializedStaticSkyra } from '#mocks/constants';
import { isValidSerializedTwemoji } from '#utils/functions';

describe('isValidSerializedTwemoji', () => {
	test('GIVEN encoded twemoji THEN returns false', () => {
		expect(isValidSerializedTwemoji(encodedBunnyTwemoji)).toBe(false);
	});

	test('GIVEN custom serialized static emoji THEN returns false', () => {
		expect(isValidSerializedTwemoji(serializedStaticSkyra)).toBe(false);
	});

	test('GIVEN custom serialized animated emoji THEN returns false', () => {
		expect(isValidSerializedTwemoji(serializedAnimatedSkyraGlasses)).toBe(false);
	});
});
