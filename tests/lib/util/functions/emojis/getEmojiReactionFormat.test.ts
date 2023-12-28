import { getEmojiReactionFormat } from '#utils/functions';
import { bunnyTwemoji, encodedBunnyTwemoji, serializedAnimatedSkyraGlasses, serializedStaticSkyra } from '../../../../mocks/constants.js';

describe('getEmojiReactionFormat', () => {
	test('GIVEN encoded twemoji THEN returns encoded twemoji', () => {
		expect(getEmojiReactionFormat(encodedBunnyTwemoji)).toBe(bunnyTwemoji);
	});

	test('GIVEN custom serialized static emoji THEN returns :_:819227046453444620>', () => {
		expect(getEmojiReactionFormat(serializedStaticSkyra)).toBe('emoji:819227046453444620');
	});

	test('GIVEN custom serialized animated emoji THEN returns _:735070572416991235>', () => {
		expect(getEmojiReactionFormat(serializedAnimatedSkyraGlasses)).toBe('emoji:735070572416991235');
	});
});
