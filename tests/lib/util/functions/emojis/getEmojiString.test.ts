import { getEmojiString } from '#utils/functions';
import { bunnyTwemoji, encodedBunnyTwemoji, serializedAnimatedSkyraGlasses, serializedStaticSkyra } from '../../../../mocks/constants.js';

describe('getEmojiString', () => {
	test(`GIVEN decoded twemoji THEN returns encoded bunny twemoji`, () => {
		expect(getEmojiString({ name: bunnyTwemoji, id: null })).toBe(encodedBunnyTwemoji);
	});

	test('GIVEN encoded twemoji THEN returns double encoded twemoji', () => {
		expect(getEmojiString({ name: encodedBunnyTwemoji, id: null })).toBe(encodeURIComponent(encodedBunnyTwemoji));
	});

	test(`GIVEN custom static emoji THEN returns ${serializedStaticSkyra}`, () => {
		expect(getEmojiString({ name: 'Skyra', id: '819227046453444620' })).toBe(serializedStaticSkyra);
	});

	test(`GIVEN custom serialized static emoji THEN returns ${serializedStaticSkyra}`, () => {
		expect(getEmojiString({ name: '_', id: '819227046453444620' })).toBe(serializedStaticSkyra);
	});

	test(`GIVEN custom animated emoji THEN returns ${serializedAnimatedSkyraGlasses}`, () => {
		expect(getEmojiString({ name: 'SkyraGlasses', id: '735070572416991235', animated: true })).toBe(serializedAnimatedSkyraGlasses);
	});

	test(`GIVEN custom serialized animated emoji THEN returns ${serializedAnimatedSkyraGlasses}`, () => {
		expect(getEmojiString({ name: '_', id: '735070572416991235', animated: true })).toBe(serializedAnimatedSkyraGlasses);
	});
});
