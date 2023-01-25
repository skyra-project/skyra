import { getEncodedTwemoji } from '#utils/functions';

describe('getEncodedTwemoji', () => {
	test('GIVEN twemoji icon THEN returns identifier for the CDN', () => {
		expect(getEncodedTwemoji('😀')).toEqual('1f600');
	});
});
