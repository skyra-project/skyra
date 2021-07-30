import { streamToBuffer } from '#utils/common';
import { resolveImage } from 'canvas-constructor/skia';
import { createReadStream } from 'fs';
import { resolve } from 'path';

describe('util common iterators', () => {
	describe('streamToBuffer', () => {
		test('GIVEN path to file THEN converts to Buffer', async () => {
			const filePath = resolve(__dirname, '..', '..', '..', 'mocks', 'image.png');
			const readStream = createReadStream(filePath);
			const buffer = await streamToBuffer(readStream);
			const image = await resolveImage(buffer);

			expect(image.width).toBe(32);
			expect(image.height).toBe(32);
		});
	});
});
