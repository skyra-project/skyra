import {
	animatedSkyraGlasses,
	bunnyTwemoji,
	encodedBunnyTwemoji,
	serializedAnimatedSkyraGlasses,
	serializedStaticSkyra,
	staticSkyra
} from '#mocks/constants';
import { isValidSerializedTwemoji } from '#utils/functions';

describe('isValidSerializedTwemoji', () => {
	test('GIVEN decoded twemoji THEN returns true', () => {
		expect(isValidSerializedTwemoji(bunnyTwemoji)).toBe(true);
	});

	test('GIVEN encoded twemoji THEN returns false', () => {
		expect(isValidSerializedTwemoji(encodedBunnyTwemoji)).toBe(false);
	});

	test('GIVEN custom static emoji THEN returns false', () => {
		expect(isValidSerializedTwemoji(staticSkyra)).toBe(false);
	});

	test('GIVEN custom serialized static emoji THEN returns false', () => {
		expect(isValidSerializedTwemoji(serializedStaticSkyra)).toBe(false);
	});

	test('GIVEN custom animated emoji THEN returns false', () => {
		expect(isValidSerializedTwemoji(animatedSkyraGlasses)).toBe(false);
	});

	test('GIVEN custom serialized animated emoji THEN returns false', () => {
		expect(isValidSerializedTwemoji(serializedAnimatedSkyraGlasses)).toBe(false);
	});
});
