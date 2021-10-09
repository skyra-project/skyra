import { encodedBunnyTwemoji, serializedAnimatedSkyraGlasses, serializedStaticSkyra } from '#mocks/constants';
import { areEmojisEqual, SerializedEmoji } from '#utils/functions';

describe('areEmojisEqual', () => {
	test('GIVEN two encoded twemoji THEN true', () => {
		expect(areEmojisEqual(encodedBunnyTwemoji, encodedBunnyTwemoji)).toBe(true);
	});

	test('GIVEN two custom static serialized emojis THEN returns true', () => {
		expect(areEmojisEqual(serializedStaticSkyra, serializedStaticSkyra)).toBe(true);
	});

	test('GIVEN two custom animated serialized emojis THEN returns true', () => {
		expect(areEmojisEqual(serializedAnimatedSkyraGlasses, serializedAnimatedSkyraGlasses)).toBe(true);
	});

	test('GIVEN custom animated serialized emoji and custom static serialized emoji THEN returns false', () => {
		expect(areEmojisEqual(serializedAnimatedSkyraGlasses, serializedStaticSkyra)).toBe(false);
	});

	test('GIVEN custom animated serialized emoji and custom static serialized emoji WITH same ID THEN returns true', () => {
		expect(areEmojisEqual('a819227046453444620' as SerializedEmoji, 's819227046453444620' as SerializedEmoji)).toBe(true);
	});
});
