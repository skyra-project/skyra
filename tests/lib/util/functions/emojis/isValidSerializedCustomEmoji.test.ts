import {
	animatedSkyraGlasses,
	bunnyTwemoji,
	encodedBunnyTwemoji,
	serializedAnimatedSkyraGlasses,
	serializedStaticSkyra,
	staticSkyra
} from '#mocks/constants';
import { isValidSerializedCustomEmoji } from '#utils/functions';

describe('isValidSerializedCustomEmoji', () => {
	test('GIVEN decoded twemoji THEN returns false', () => {
		expect(isValidSerializedCustomEmoji(bunnyTwemoji)).toBe(false);
	});

	test('GIVEN encoded twemoji THEN returns false', () => {
		expect(isValidSerializedCustomEmoji(encodedBunnyTwemoji)).toBe(false);
	});

	test('GIVEN custom static emoji THEN returns false', () => {
		expect(isValidSerializedCustomEmoji(staticSkyra)).toBe(false);
	});

	test('GIVEN custom serialized static emoji THEN returns true', () => {
		expect(isValidSerializedCustomEmoji(serializedStaticSkyra)).toBe(true);
	});

	test('GIVEN custom animated emoji THEN returns false', () => {
		expect(isValidSerializedCustomEmoji(animatedSkyraGlasses)).toBe(false);
	});

	test('GIVEN custom serialized animated emoji THEN returns true', () => {
		expect(isValidSerializedCustomEmoji(serializedAnimatedSkyraGlasses)).toBe(true);
	});
});
