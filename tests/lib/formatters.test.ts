import type { GuildMessage } from '#lib/types';
import { formatMessage } from '#utils/formatters';
import { container } from '@sapphire/framework';
import { EmbedType, Message, MessageFlags, type APIMessage } from 'discord.js';
import { client } from '../mocks/MockInstances.js';

describe('formatters', () => {
	describe('formatMessage', () => {
		beforeAll(() => container.i18n.init());

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
					bot: true,
					global_name: null
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
				flags: MessageFlags.Ephemeral
			};

			return Reflect.construct(Message, [client, { ...messageData, ...data }]) as GuildMessage;
		}

		function t() {
			return container.i18n.getT('en-US');
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

		test('GIVEN embed author only THEN returns embed author only', () => {
			const message = createMessage({
				embeds: [{ author: { name: 'Skyra', icon_url: 'https://skyra.pw/avatars/skyra.png', url: 'https://skyra.pw' } }]
			});

			expect(formatMessage(t(), message)).toBe(
				join(
					'[3/26/21, 10:29:51 PM] Skyra#7023 [BOT]', //
					'> 👤 [https://skyra.pw/avatars/skyra.png] Skyra <https://skyra.pw>'
				)
			);
		});

		test('GIVEN embed author with name only THEN returns embed author with name only', () => {
			const message = createMessage({ embeds: [{ author: { name: 'Skyra' } }] });

			expect(formatMessage(t(), message)).toBe(
				join(
					'[3/26/21, 10:29:51 PM] Skyra#7023 [BOT]', //
					'> 👤 Skyra'
				)
			);
		});

		test('GIVEN embed author with iconURL only THEN returns embed author with iconURL only', () => {
			const message = createMessage({ embeds: [{ author: { name: '', icon_url: 'https://skyra.pw/avatars/skyra.png' } }] });

			expect(formatMessage(t(), message)).toBe(
				join(
					'[3/26/21, 10:29:51 PM] Skyra#7023 [BOT]', //
					'> 👤 [https://skyra.pw/avatars/skyra.png] -'
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
					'>_ [https://skyra.pw/avatars/skyra.png]'
				)
			);
		});

		test('GIVEN embed footer with icon and text THEN returns embed footer with icon and text', () => {
			const message = createMessage({ embeds: [{ footer: { icon_url: 'https://skyra.pw/avatars/skyra.png', text: 'Yes, that is me!' } }] });

			expect(formatMessage(t(), message)).toBe(
				join(
					'[3/26/21, 10:29:51 PM] Skyra#7023 [BOT]', //
					'>_ [https://skyra.pw/avatars/skyra.png] - Yes, that is me!'
				)
			);
		});

		test('GIVEN image embed THEN returns image embed', () => {
			const message = createMessage({
				embeds: [
					{
						type: EmbedType.Image,
						url: 'https://media.discordapp.net/attachments/758186338217492503/825157377090912296/birdflip2.gif',
						thumbnail: {
							url: 'https://media.discordapp.net/attachments/758186338217492503/825157377090912296/birdflip2.gif',
							proxy_url:
								'https://images-ext-2.discordapp.net/external/nFHEK4-YMyLCGsv4MbtTgwxCudyi3Q6jezLx4cLdfOc/https/media.discordapp.net/attachments/758186338217492503/825157377090912296/birdflip2.gif',
							width: 494,
							height: 368
						}
					}
				]
			});

			expect(formatMessage(t(), message)).toBe(
				join(
					'[3/26/21, 10:29:51 PM] Skyra#7023 [BOT]', //
					'> 📎 https://media.discordapp.net/attachments/758186338217492503/825157377090912296/birdflip2.gif'
				)
			);
		});

		test('GIVEN video embed THEN returns video embed', () => {
			const message = createMessage({
				embeds: [
					{
						type: EmbedType.Video,
						url: 'https://www.youtube.com/watch?v=5dqixBi8TPU',
						title: "LADY'S ONLY feat. Marpril - Throwback",
						description:
							"ハッとした時の冷却。\n\n【Throwback】\n\nVocal ：Marpril \n立花鈴\nhttps://twitter.com/Rin04ple\n谷田透佳\nhttps://twitter.com/Touka03mar\n\nMusic：LADY'S ONLY\nhttps://twitter.com/LADY50NLY\n\nLyric：uyuni\nhttps://twitter.com/uyn_yn\n\nChoreographer：ALEXANDER KAWAMOTO(アレックス) \nhttps://www.instagram.com/alex_kwmt/ \n\nMovie：ノノル ／ ヲタきち\nThrowback ロゴデザイン　チョロみ\nhttps://twitter.com/nonolu41...",
						color: 16711680,
						author: {
							name: 'Marpril Channel',
							url: 'https://www.youtube.com/channel/UCWhv732tk4DAQ7X32qHKrfA'
						},
						provider: {
							name: 'YouTube',
							url: 'https://www.youtube.com'
						},
						thumbnail: {
							url: 'https://i.ytimg.com/vi/5dqixBi8TPU/maxresdefault.jpg',
							proxy_url:
								'https://images-ext-1.discordapp.net/external/gk1nrmD5dvvSyYrFm1tMGNOm6f80Ps1hyX8zf9bYImw/https/i.ytimg.com/vi/5dqixBi8TPU/maxresdefault.jpg',
							width: 1280,
							height: 720
						},
						video: {
							url: 'https://www.youtube.com/embed/5dqixBi8TPU',
							width: 1280,
							height: 720
						}
					}
				]
			});

			expect(formatMessage(t(), message)).toBe(
				join(
					'[3/26/21, 10:29:51 PM] Skyra#7023 [BOT]', //
					'🔖 [https://www.youtube.com/watch?v=5dqixBi8TPU] (YouTube).'
				)
			);
		});
	});
});
