import { GuildMessage } from '#lib/types';
import { client, textChannel } from '#mocks/MockInstances';
import { formatMessage } from '#utils/formatters';
import { APIMessage } from 'discord-api-types/v6';
import { Message } from 'discord.js';

describe('formatters', () => {
	describe('formatMessage', () => {
		beforeAll(() => client.i18n.init());

		function createMessage(data: Partial<APIMessage> = {}): GuildMessage {
			const messageData: APIMessage = {
				id: '825134485813067796',
				type: 0,
				content: '',
				channel_id: '331027040306331648',
				author: {
					id: '266624760782258186',
					username: 'Skyra',
					avatar: '51227d2976cc66b9c1add6b911eda5e9',
					discriminator: '7023',
					public_flags: 65536,
					bot: true
				},
				attachments: [],
				embeds: [],
				mentions: [],
				mention_roles: [],
				pinned: false,
				mention_everyone: false,
				tts: false,
				timestamp: '2021-03-26T22:29:51.675000+00:00',
				edited_timestamp: '2021-03-26T22:29:56.581000+00:00',
				flags: 0
			};

			return new Message(client, { ...messageData, ...data }, textChannel) as GuildMessage;
		}

		function t() {
			return client.i18n.fetchT('en-US');
		}

		function join(...parts: string[]) {
			return parts.join('\n');
		}

		test('GIVEN empty message THEN returns header only', () => {
			const message = createMessage();

			expect(formatMessage(t(), message)).toBe(
				join(
					'[3/26/21, 10:29:51 PM] Skyra#7023 [BOT]', //
					''
				)
			);
		});

		test('GIVEN content only THEN returns content only', () => {
			const message = createMessage({ content: 'Hello World' });

			expect(formatMessage(t(), message)).toBe(
				join(
					'[3/26/21, 10:29:51 PM] Skyra#7023 [BOT]', //
					'> Hello World'
				)
			);
		});

		test('GIVEN content only with block quotes THEN returns content only with nested block quotes', () => {
			const message = createMessage({ content: '> Block Quotes!' });

			expect(formatMessage(t(), message)).toBe(
				join(
					'[3/26/21, 10:29:51 PM] Skyra#7023 [BOT]', //
					'> > Block Quotes!'
				)
			);
		});

		test('GIVEN embed title only THEN returns embed title only', () => {
			const message = createMessage({ embeds: [{ title: 'Your Title Goes Here' }] });

			expect(formatMessage(t(), message)).toBe(
				join(
					'[3/26/21, 10:29:51 PM] Skyra#7023 [BOT]', //
					'># Your Title Goes Here'
				)
			);
		});

		test('GIVEN embed description only THEN returns embed description only', () => {
			const message = createMessage({ embeds: [{ description: 'Hello!' }] });

			expect(formatMessage(t(), message)).toBe(
				join(
					'[3/26/21, 10:29:51 PM] Skyra#7023 [BOT]', //
					'> > Hello!'
				)
			);
		});

		test('GIVEN embed with one field only THEN returns embed with one field only', () => {
			const message = createMessage({ embeds: [{ fields: [{ name: 'Hello', value: 'World!' }] }] });

			expect(formatMessage(t(), message)).toBe(
				join(
					'[3/26/21, 10:29:51 PM] Skyra#7023 [BOT]', //
					'> #> Hello',
					'>  > World!'
				)
			);
		});

		test('GIVEN embed with two fields THEN returns embed with two fields', () => {
			const message = createMessage({
				embeds: [
					{
						fields: [
							{ name: 'Hello', value: 'World!' },
							{ name: 'Foo', value: 'Bar' }
						]
					}
				]
			});

			expect(formatMessage(t(), message)).toBe(
				join(
					'[3/26/21, 10:29:51 PM] Skyra#7023 [BOT]', //
					'> #> Hello',
					'>  > World!',
					'> #> Foo',
					'>  > Bar'
				)
			);
		});

		test('GIVEN embed with description and two fields THEN returns embed with description and two fields', () => {
			const message = createMessage({
				embeds: [
					{
						description: 'This is a description!',
						fields: [
							{ name: 'Hello', value: 'World!' },
							{ name: 'Foo', value: 'Bar' }
						]
					}
				]
			});

			expect(formatMessage(t(), message)).toBe(
				join(
					'[3/26/21, 10:29:51 PM] Skyra#7023 [BOT]', //
					'> > This is a description!',
					'> #> Hello',
					'>  > World!',
					'> #> Foo',
					'>  > Bar'
				)
			);
		});

		test('GIVEN embed with image only THEN returns embed with image only', () => {
			const message = createMessage({ embeds: [{ image: { url: 'https://skyra.pw/avatars/skyra.png' } }] });

			expect(formatMessage(t(), message)).toBe(
				join(
					'[3/26/21, 10:29:51 PM] Skyra#7023 [BOT]', //
					'>🖼️ [https://skyra.pw/avatars/skyra.png]'
				)
			);
		});

		test('GIVEN embed footer with text only THEN returns embed footer with text only', () => {
			const message = createMessage({ embeds: [{ footer: { text: 'Your Footer!' } }] });

			expect(formatMessage(t(), message)).toBe(
				join(
					'[3/26/21, 10:29:51 PM] Skyra#7023 [BOT]', //
					'>_ Your Footer!'
				)
			);
		});

		test('GIVEN embed footer with icon only THEN returns embed footer with icon only', () => {
			const message = createMessage({ embeds: [{ footer: { icon_url: 'https://skyra.pw/avatars/skyra.png', text: '' } }] });

			expect(formatMessage(t(), message)).toBe(
				join(
					'[3/26/21, 10:29:51 PM] Skyra#7023 [BOT]', //
					'>_ [🖼️ https://skyra.pw/avatars/skyra.png]'
				)
			);
		});

		test('GIVEN embed footer with icon and text THEN returns embed footer with icon and text', () => {
			const message = createMessage({ embeds: [{ footer: { icon_url: 'https://skyra.pw/avatars/skyra.png', text: 'Yes, that is me!' } }] });

			expect(formatMessage(t(), message)).toBe(
				join(
					'[3/26/21, 10:29:51 PM] Skyra#7023 [BOT]', //
					'>_ [🖼️ https://skyra.pw/avatars/skyra.png] - Yes, that is me!'
				)
			);
		});
	});
});
