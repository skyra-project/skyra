import {
	animatedSkyraGlasses,
	bunnyTwemoji,
	encodedBunnyTwemoji,
	serializedAnimatedSkyraGlasses,
	serializedStaticSkyra,
	staticSkyra
} from '#mocks/constants';
import { getEmojiId } from '#utils/functions';

describe('getEmojiId', () => {
	test(`GIVEN decoded twemoji THEN returns invalid string`, () => {
		// Note that this assertion cannot be checked with `.toBe` because 1 character is sliced off of a twemoji
		expect(getEmojiId(bunnyTwemoji)).toBeDefined();
	});

	test('GIVEN encoded twemoji THEN returns encoded twemoji', () => {
		expect(getEmojiId(encodedBunnyTwemoji)).toBe(encodedBunnyTwemoji);
	});

	test('GIVEN custom static emoji THEN returns Skyra:819227046453444620', () => {
		expect(getEmojiId(staticSkyra)).toBe('Skyra:819227046453444620');
	});

	test('GIVEN custom serialized static emoji THEN returns ID only', () => {
		expect(getEmojiId(serializedStaticSkyra)).toBe('819227046453444620');
	});

	test('GIVEN custom animated emoji THEN returns :SkyraGlasses:735070572416991235', () => {
		expect(getEmojiId(animatedSkyraGlasses)).toBe(':SkyraGlasses:735070572416991235');
	});

	test('GIVEN custom serialized animated emoji THEN returns ID only', () => {
		expect(getEmojiId(serializedAnimatedSkyraGlasses)).toBe('735070572416991235');
	});
});
