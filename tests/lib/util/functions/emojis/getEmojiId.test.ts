import { getEmojiId } from '#utils/functions';
import { encodedBunnyTwemoji, serializedAnimatedSkyraGlasses, serializedStaticSkyra } from '../../../../mocks/constants.js';

describe('getEmojiId', () => {
	test('GIVEN encoded twemoji THEN returns encoded twemoji', () => {
		expect(getEmojiId(encodedBunnyTwemoji)).toBe(encodedBunnyTwemoji);
	});

	test('GIVEN custom serialized static emoji THEN returns ID only', () => {
		expect(getEmojiId(serializedStaticSkyra)).toBe('819227046453444620');
	});

	test('GIVEN custom serialized animated emoji THEN returns ID only', () => {
		expect(getEmojiId(serializedAnimatedSkyraGlasses)).toBe('735070572416991235');
	});
});
