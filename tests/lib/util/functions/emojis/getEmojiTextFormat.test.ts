import { getEmojiTextFormat } from '#utils/functions';
import { bunnyTwemoji, encodedBunnyTwemoji, serializedAnimatedSkyraGlasses, serializedStaticSkyra } from '../../../../mocks/constants.js';

describe('getEmojiTextFormat', () => {
	test('GIVEN encoded twemoji THEN returns decoded twemoji', () => {
		expect(getEmojiTextFormat(encodedBunnyTwemoji)).toBe(bunnyTwemoji);
	});

	test('GIVEN custom serialized static emoji THEN returns <:_:819227046453444620>', () => {
		expect(getEmojiTextFormat(serializedStaticSkyra)).toBe('<:_:819227046453444620>');
	});

	test('GIVEN custom serialized animated emoji THEN returns <a:_:735070572416991235>', () => {
		expect(getEmojiTextFormat(serializedAnimatedSkyraGlasses)).toBe('<a:_:735070572416991235>');
	});
});
