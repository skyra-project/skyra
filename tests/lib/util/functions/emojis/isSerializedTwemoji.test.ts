import {
	animatedSkyraGlasses,
	bunnyTwemoji,
	encodedBunnyTwemoji,
	serializedAnimatedSkyraGlasses,
	serializedStaticSkyra,
	staticSkyra
} from '#mocks/constants';
import { isSerializedTwemoji } from '#utils/functions';

describe('isSerializedTwemoji', () => {
	test('GIVEN decoded twemoji THEN returns false', () => {
		expect(isSerializedTwemoji(bunnyTwemoji)).toBe(false);
	});

	test('GIVEN encoded twemoji THEN returns true', () => {
		expect(isSerializedTwemoji(encodedBunnyTwemoji)).toBe(true);
	});

	test('GIVEN custom static emoji THEN returns false', () => {
		expect(isSerializedTwemoji(staticSkyra)).toBe(false);
	});

	test('GIVEN custom serialized static emoji THEN returns false', () => {
		expect(isSerializedTwemoji(serializedStaticSkyra)).toBe(false);
	});

	test('GIVEN custom animated emoji THEN returns false', () => {
		expect(isSerializedTwemoji(animatedSkyraGlasses)).toBe(false);
	});

	test('GIVEN custom serialized animated emoji THEN returns false', () => {
		expect(isSerializedTwemoji(serializedAnimatedSkyraGlasses)).toBe(false);
	});
});
