import { isValidTwemoji } from '#utils/functions';
import {
	animatedSkyraGlasses,
	bunnyTwemoji,
	encodedBunnyTwemoji,
	serializedAnimatedSkyraGlasses,
	serializedStaticSkyra,
	staticSkyra
} from '../../../../mocks/constants.js';

describe('isValidTwemoji', () => {
	test('GIVEN decoded twemoji THEN returns true', () => {
		expect(isValidTwemoji(bunnyTwemoji)).toBe(true);
	});

	test('GIVEN encoded twemoji THEN returns false', () => {
		expect(isValidTwemoji(encodedBunnyTwemoji)).toBe(false);
	});

	test('GIVEN custom static emoji THEN returns false', () => {
		expect(isValidTwemoji(staticSkyra)).toBe(false);
	});

	test('GIVEN custom serialized static emoji THEN returns false', () => {
		expect(isValidTwemoji(serializedStaticSkyra)).toBe(false);
	});

	test('GIVEN custom animated emoji THEN returns false', () => {
		expect(isValidTwemoji(animatedSkyraGlasses)).toBe(false);
	});

	test('GIVEN custom serialized animated emoji THEN returns false', () => {
		expect(isValidTwemoji(serializedAnimatedSkyraGlasses)).toBe(false);
	});
});
