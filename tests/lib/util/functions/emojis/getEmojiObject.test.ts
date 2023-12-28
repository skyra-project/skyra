import { getEmojiObject, type EmojiObject } from '#utils/functions';
import {
	animatedSkyraGlasses,
	bunnyTwemoji,
	encodedBunnyTwemoji,
	serializedAnimatedSkyraGlasses,
	serializedStaticSkyra,
	staticSkyra
} from '../../../../mocks/constants.js';

describe('getEmojiObject', () => {
	test(`GIVEN decoded twemoji THEN returns emoji as name; id as null`, () => {
		expect(getEmojiObject('🐰')).toEqual<EmojiObject>({ name: bunnyTwemoji, id: null });
	});

	test('GIVEN encoded twemoji THEN returns null', () => {
		expect(getEmojiObject(encodedBunnyTwemoji)).toBeNull();
	});

	test('GIVEN custom static emoji THEN returns full emoji object', () => {
		expect(getEmojiObject(staticSkyra)).toEqual<EmojiObject>({ name: 'Skyra', id: '819227046453444620', animated: false });
	});

	test('GIVEN custom serialized static emoji THEN returns null', () => {
		expect(getEmojiObject(serializedStaticSkyra)).toBeNull();
	});

	test('GIVEN custom animated emoji THEN returns full emoji object', () => {
		expect(getEmojiObject(animatedSkyraGlasses)).toEqual<EmojiObject>({
			name: 'SkyraGlasses',
			id: '735070572416991235',
			animated: true
		});
	});

	test('GIVEN custom serialized animated emoji THEN returns null', () => {
		expect(getEmojiObject(serializedAnimatedSkyraGlasses)).toBeNull();
	});
});
