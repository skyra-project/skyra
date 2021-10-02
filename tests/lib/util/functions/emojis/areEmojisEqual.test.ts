import {
	animatedSkyraGlasses,
	bunnyTwemoji,
	encodedBunnyTwemoji,
	serializedAnimatedSkyraGlasses,
	serializedStaticSkyra,
	staticSkyra
} from '#mocks/constants';
import { areEmojisEqual } from '#utils/functions';

describe('areEmojisEqual', () => {
	test(`GIVEN two decoded twemojis THEN returns true`, () => {
		expect(areEmojisEqual(bunnyTwemoji, bunnyTwemoji)).toBe(true);
	});

	test('GIVEN two encoded twemoji THEN true', () => {
		expect(areEmojisEqual(encodedBunnyTwemoji, encodedBunnyTwemoji)).toBe(true);
	});

	test('GIVEN encoded and decoded twemoji THEN false', () => {
		expect(areEmojisEqual(bunnyTwemoji, encodedBunnyTwemoji)).toBe(false);
	});

	test('GIVEN two custom static emojis THEN returns true', () => {
		expect(areEmojisEqual(staticSkyra, staticSkyra)).toBe(true);
	});

	test('GIVEN two custom static serialized emojis THEN returns true', () => {
		expect(areEmojisEqual(serializedStaticSkyra, serializedStaticSkyra)).toBe(true);
	});

	test('GIVEN custom static and custom static serialized emojis THEN returns false', () => {
		expect(areEmojisEqual(staticSkyra, serializedAnimatedSkyraGlasses)).toBe(false);
	});

	test('GIVEN two custom animated emojis THEN returns true', () => {
		expect(areEmojisEqual(animatedSkyraGlasses, animatedSkyraGlasses)).toBe(true);
	});

	test('GIVEN two custom animated serialized emojis THEN returns true', () => {
		expect(areEmojisEqual(serializedAnimatedSkyraGlasses, serializedAnimatedSkyraGlasses)).toBe(true);
	});

	test('GIVEN custom animated and custom animated serialized emojis THEN returns false', () => {
		expect(areEmojisEqual(animatedSkyraGlasses, serializedAnimatedSkyraGlasses)).toBe(false);
	});
});
