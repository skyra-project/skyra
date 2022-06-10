import { animatedSkyraGlasses, encodedBunnyTwemoji, serializedAnimatedSkyraGlasses, serializedStaticSkyra, staticSkyra } from '#common/constants';
import { isValidCustomEmoji } from '#utils/functions';

describe('isValidCustomEmoji', () => {
	test('GIVEN encoded twemoji THEN returns false', () => {
		expect(isValidCustomEmoji(encodedBunnyTwemoji)).toBe(false);
	});

	test('GIVEN custom static emoji THEN returns true', () => {
		expect(isValidCustomEmoji(staticSkyra)).toBe(true);
	});

	test('GIVEN custom animated emoji THEN returns true', () => {
		expect(isValidCustomEmoji(animatedSkyraGlasses)).toBe(true);
	});

	test('GIVEN custom serialized static emoji THEN returns false', () => {
		expect(isValidCustomEmoji(serializedStaticSkyra)).toBe(false);
	});

	test('GIVEN custom serialized animated emoji THEN returns false', () => {
		expect(isValidCustomEmoji(serializedAnimatedSkyraGlasses)).toBe(false);
	});
});
