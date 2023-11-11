import { resolveEmojiId } from '#utils/functions';
import { bunnyTwemoji, encodedBunnyTwemoji, serializedAnimatedSkyraGlasses, serializedStaticSkyra } from '../../../../mocks/constants.js';

describe('resolveEmojiId', () => {
	test('GIVEN encoded twemoji THEN returns encoded twemoji', () => {
		expect(resolveEmojiId(encodedBunnyTwemoji)).toBe(encodedBunnyTwemoji);
	});

	test('GIVEN custom serialized static emoji THEN returns ID only', () => {
		expect(resolveEmojiId(serializedStaticSkyra)).toBe('819227046453444620');
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
