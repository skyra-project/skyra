import { streamToBuffer } from '#utils/common';
import { Image } from 'canvas';
import { createReadStream } from 'fs';
import { resolve } from 'path';

describe('util common iterators', () => {
	describe('streamToBuffer', () => {
		test('GIVEN path to file THEN converts to Buffer', async () => {
			const filePath = resolve(__dirname, '..', '..', '..', 'mocks', 'image.png');
			const readStream = createReadStream(filePath);
			const buffer = await streamToBuffer(readStream);

			const image = new Image();
			image.src = buffer;

			expect(image.width).toBe(32);
			expect(image.height).toBe(32);
		});
	});
});
