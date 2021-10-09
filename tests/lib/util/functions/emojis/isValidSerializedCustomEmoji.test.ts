import { encodedBunnyTwemoji, serializedAnimatedSkyraGlasses, serializedStaticSkyra } from '#mocks/constants';
import { isValidSerializedCustomEmoji } from '#utils/functions';

describe('isValidSerializedCustomEmoji', () => {
	test('GIVEN encoded twemoji THEN returns false', () => {
		expect(isValidSerializedCustomEmoji(encodedBunnyTwemoji)).toBe(false);
	});

	test('GIVEN custom serialized static emoji THEN returns true', () => {
		expect(isValidSerializedCustomEmoji(serializedStaticSkyra)).toBe(true);
	});

	test('GIVEN custom serialized animated emoji THEN returns true', () => {
		expect(isValidSerializedCustomEmoji(serializedAnimatedSkyraGlasses)).toBe(true);
	});
});
