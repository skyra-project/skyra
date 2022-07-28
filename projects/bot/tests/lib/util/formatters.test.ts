/* eslint-disable @typescript-eslint/dot-notation */
import * as utilFormatters from '#utils/formatters';
import type { MessageAttachment } from 'discord.js';

describe('utilFormatters', () => {
	describe('formatAttachment', () => {
		test('GIVEN attachment THEN formats into string', () => {
			expect(utilFormatters.formatAttachment({ name: 'file.png', url: 'file://file.png' } as unknown as MessageAttachment)).toEqual(
				'📂 [file.png: file://file.png]'
			);
		});
	});
});
