import { getTwemojiUrl } from '#utils/functions';

describe('getTwemojiUrl', () => {
	test('GIVEN twemoji icon THEN returns identifier for the CDN', () => {
		const expected = 'https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/1f600.png';
		expect<typeof expected>(getTwemojiUrl('1f600')).toEqual(expected);
	});
});
