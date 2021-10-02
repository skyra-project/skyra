import {
	animatedSkyraGlasses,
	bunnyTwemoji,
	encodedBunnyTwemoji,
	serializedAnimatedSkyraGlasses,
	serializedStaticSkyra,
	staticSkyra
} from '#mocks/constants';
import { resolveEmojiId } from '#utils/functions';

describe('resolveEmojiId', () => {
	test(`GIVEN decoded twemoji THEN returns invalid string`, () => {
		// Note that this assertion cannot be checked with `.toBe` because 1 character is sliced off of a twemoji
		expect(resolveEmojiId(bunnyTwemoji)).toBeDefined();
	});

	test('GIVEN encoded twemoji THEN returns encoded twemoji', () => {
		expect(resolveEmojiId(encodedBunnyTwemoji)).toBe(encodedBunnyTwemoji);
	});

	test('GIVEN custom static emoji THEN returns Skyra:819227046453444620', () => {
		expect(resolveEmojiId(staticSkyra)).toBe('Skyra:819227046453444620');
	});

	test('GIVEN custom serialized static emoji THEN returns ID only', () => {
		expect(resolveEmojiId(serializedStaticSkyra)).toBe('819227046453444620');
	});

	test('GIVEN custom animated emoji THEN returns :SkyraGlasses:735070572416991235', () => {
		expect(resolveEmojiId(animatedSkyraGlasses)).toBe(':SkyraGlasses:735070572416991235');
	});

	test('GIVEN custom serialized animated emoji THEN returns ID only', () => {
		expect(resolveEmojiId(serializedAnimatedSkyraGlasses)).toBe('735070572416991235');
	});

	test('GIVEN EmojiObject with ID THEN returns ID', () => {
		expect(resolveEmojiId({ name: 'SkyraGlasses', id: '735070572416991235', animated: true })).toBe('735070572416991235');
	});

	test('GIVEN EmojiObject without ID THEN encoded name', () => {
		expect(resolveEmojiId({ name: bunnyTwemoji, id: null, animated: true })).toBe(encodedBunnyTwemoji);
	});
});
