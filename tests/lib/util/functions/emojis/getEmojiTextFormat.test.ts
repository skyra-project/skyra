import {
	animatedSkyraGlasses,
	bunnyTwemoji,
	encodedBunnyTwemoji,
	serializedAnimatedSkyraGlasses,
	serializedStaticSkyra,
	staticSkyra
} from '#mocks/constants';
import { getEmojiTextFormat } from '#utils/functions';

describe('getEmojiTextFormat', () => {
	test(`GIVEN decoded twemoji THEN returns invalid string`, () => {
		// Note that this assertion cannot be checked with `.toBe` because 1 character is sliced off of a twemoji
		expect(getEmojiTextFormat(bunnyTwemoji)).toBeDefined();
	});

	test('GIVEN encoded twemoji THEN returns decoded twemoji', () => {
		expect(getEmojiTextFormat(encodedBunnyTwemoji)).toBe(bunnyTwemoji);
	});

	test('GIVEN custom static emoji THEN returns <:_:Skyra:819227046453444620>', () => {
		expect(getEmojiTextFormat(staticSkyra)).toBe('<:_:Skyra:819227046453444620>');
	});

	test('GIVEN custom serialized static emoji THEN returns <:_:819227046453444620>', () => {
		expect(getEmojiTextFormat(serializedStaticSkyra)).toBe('<:_:819227046453444620>');
	});

	test('GIVEN custom animated emoji THEN returns <a:_::SkyraGlasses:735070572416991235>', () => {
		expect(getEmojiTextFormat(animatedSkyraGlasses)).toBe('<a:_::SkyraGlasses:735070572416991235>');
	});

	test('GIVEN custom serialized animated emoji THEN returns <a:_:735070572416991235>', () => {
		expect(getEmojiTextFormat(serializedAnimatedSkyraGlasses)).toBe('<a:_:735070572416991235>');
	});
});
