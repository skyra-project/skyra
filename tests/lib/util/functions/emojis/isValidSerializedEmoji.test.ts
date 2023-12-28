import { isValidSerializedEmoji } from '#utils/functions';
import {
	animatedSkyraGlasses,
	encodedBunnyTwemoji,
	serializedAnimatedSkyraGlasses,
	serializedStaticSkyra,
	staticSkyra
} from '../../../../mocks/constants.js';

describe('isValidSerializedEmoji', () => {
	test('GIVEN encoded twemoji THEN returns true', () => {
		expect(isValidSerializedEmoji(encodedBunnyTwemoji)).toBe(true);
	});

	test('GIVEN custom serialized static emoji THEN returns true', () => {
		expect(isValidSerializedEmoji(serializedStaticSkyra)).toBe(true);
	});

	test('GIVEN custom serialized animated emoji THEN returns true', () => {
		expect(isValidSerializedEmoji(serializedAnimatedSkyraGlasses)).toBe(true);
	});

	test('GIVEN custom static emoji THEN returns false', () => {
		expect(isValidSerializedEmoji(staticSkyra)).toBe(false);
	});

	test('GIVEN custom animated emoji THEN returns false', () => {
		expect(isValidSerializedEmoji(animatedSkyraGlasses)).toBe(false);
	});
});
