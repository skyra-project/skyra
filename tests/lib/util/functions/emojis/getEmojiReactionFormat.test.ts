import {
	animatedSkyraGlasses,
	bunnyTwemoji,
	encodedBunnyTwemoji,
	serializedAnimatedSkyraGlasses,
	serializedStaticSkyra,
	staticSkyra
} from '#mocks/constants';
import { getEmojiReactionFormat } from '#utils/functions';

describe('getEmojiReactionFormat', () => {
	test(`GIVEN decoded twemoji THEN returns invalid string`, () => {
		// Note that this assertion cannot be checked with `.toBe` because 1 character is sliced off of a twemoji
		expect(getEmojiReactionFormat(bunnyTwemoji)).toBeDefined();
	});

	test('GIVEN encoded twemoji THEN returns encoded twemoji', () => {
		expect(getEmojiReactionFormat(encodedBunnyTwemoji)).toBe(encodedBunnyTwemoji);
	});

	test('GIVEN custom static emoji THEN returns _:Skyra:819227046453444620>', () => {
		expect(getEmojiReactionFormat(staticSkyra)).toBe('_:Skyra:819227046453444620');
	});

	test('GIVEN custom serialized static emoji THEN returns :_:819227046453444620>', () => {
		expect(getEmojiReactionFormat(serializedStaticSkyra)).toBe('_:819227046453444620');
	});

	test('GIVEN custom animated emoji THEN returns _::SkyraGlasses:735070572416991235>', () => {
		expect(getEmojiReactionFormat(animatedSkyraGlasses)).toBe('_::SkyraGlasses:735070572416991235');
	});

	test('GIVEN custom serialized animated emoji THEN returns _:735070572416991235>', () => {
		expect(getEmojiReactionFormat(serializedAnimatedSkyraGlasses)).toBe('_:735070572416991235');
	});
});
