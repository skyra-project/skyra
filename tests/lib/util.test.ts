import * as utils from '#utils/util';
import type { DeepPartial } from '@sapphire/utilities';
import { Attachment, Collection, Embed, Message, type APIAttachment } from 'discord.js';
import { createEmbed, createUser } from '../mocks/MockInstances.js';

describe('Utils', () => {
	describe('IMAGE_EXTENSION', () => {
		test('GIVEN valid extensions THEN passes test', () => {
			expect(utils.IMAGE_EXTENSION.test('.bmp')).toBe(true);
			expect(utils.IMAGE_EXTENSION.test('.jpg')).toBe(true);
			expect(utils.IMAGE_EXTENSION.test('.jpeg')).toBe(true);
			expect(utils.IMAGE_EXTENSION.test('.png')).toBe(true);
			expect(utils.IMAGE_EXTENSION.test('.gif')).toBe(true);
			expect(utils.IMAGE_EXTENSION.test('.webp')).toBe(true);
		});

		test("GIVEN extension without period THEN doesn't pass test", () => {
			expect(utils.IMAGE_EXTENSION.test('bmp')).toBe(false);
			expect(utils.IMAGE_EXTENSION.test('jpg')).toBe(false);
			expect(utils.IMAGE_EXTENSION.test('jpeg')).toBe(false);
			expect(utils.IMAGE_EXTENSION.test('png')).toBe(false);
			expect(utils.IMAGE_EXTENSION.test('gif')).toBe(false);
			expect(utils.IMAGE_EXTENSION.test('webp')).toBe(false);
		});

		test("GIVEN invalid extensions THEN doesn't pass test", () => {
			expect(utils.IMAGE_EXTENSION.test('.mp4')).toBe(false);
			expect(utils.IMAGE_EXTENSION.test('.mp3')).toBe(false);
			expect(utils.IMAGE_EXTENSION.test('.aac')).toBe(false);
			expect(utils.IMAGE_EXTENSION.test('.mkv')).toBe(false);
		});
	});

	describe('extractDetailedMentions', () => {
		test('GIVEN empty string THEN returns empty results', () => {
			const result = utils.extractDetailedMentions('');
			expect(result.channels.size).toBe(0);
			expect(result.roles.size).toBe(0);
			expect(result.users.size).toBe(0);
			expect(result.parse).toStrictEqual([]);
		});

		test('GIVEN a user mention THEN returns one user ID', () => {
			const result = utils.extractDetailedMentions('<@242043489611808769>');
			expect(result.channels.size).toBe(0);
			expect(result.roles.size).toBe(0);
			expect([...result.users]).toStrictEqual(['242043489611808769']);
			expect(result.parse).toStrictEqual([]);
		});

		test('GIVEN a member mention THEN returns one user ID', () => {
			const result = utils.extractDetailedMentions('<@!242043489611808769>');
			expect(result.channels.size).toBe(0);
			expect(result.roles.size).toBe(0);
			expect([...result.users]).toStrictEqual(['242043489611808769']);
			expect(result.parse).toStrictEqual([]);
		});

		test('GIVEN a duplicated user mention THEN returns only one user ID', () => {
			const result = utils.extractDetailedMentions('<@242043489611808769> <@!242043489611808769>');
			expect(result.channels.size).toBe(0);
			expect(result.roles.size).toBe(0);
			expect([...result.users]).toStrictEqual(['242043489611808769']);
			expect(result.parse).toStrictEqual([]);
		});

		test('GIVEN a channel mention THEN returns one channel ID', () => {
			const result = utils.extractDetailedMentions('<#541740581832097792>');
			expect([...result.channels]).toStrictEqual(['541740581832097792']);
			expect(result.roles.size).toBe(0);
			expect(result.users.size).toBe(0);
			expect(result.parse).toStrictEqual([]);
		});

		test('GIVEN a duplicated channel mention THEN returns only one channel ID', () => {
			const result = utils.extractDetailedMentions('<#541740581832097792> <#541740581832097792>');
			expect([...result.channels]).toStrictEqual(['541740581832097792']);
			expect(result.roles.size).toBe(0);
			expect(result.users.size).toBe(0);
			expect(result.parse).toStrictEqual([]);
		});

		test('GIVEN a role mention THEN returns one role ID', () => {
			const result = utils.extractDetailedMentions('<@&541739191776575502>');
			expect(result.channels.size).toBe(0);
			expect([...result.roles]).toStrictEqual(['541739191776575502']);
			expect(result.users.size).toBe(0);
			expect(result.parse).toStrictEqual([]);
		});

		test('GIVEN a duplicated role mention THEN returns only one role ID', () => {
			const result = utils.extractDetailedMentions('<@&541739191776575502> <@&541739191776575502>');
			expect(result.channels.size).toBe(0);
			expect([...result.roles]).toStrictEqual(['541739191776575502']);
			expect(result.users.size).toBe(0);
			expect(result.parse).toStrictEqual([]);
		});

		test('GIVEN invalid mentions (ID shorter than 17 digits) THEN returns empty results', () => {
			const result = utils.extractDetailedMentions('<#5417391917765755> <@&5417391917765755> <@5417391917765755> <@!5417391917765755>');
			expect(result.channels.size).toBe(0);
			expect(result.roles.size).toBe(0);
			expect(result.users.size).toBe(0);
			expect(result.parse).toStrictEqual([]);
		});

		test('GIVEN invalid mentions (ID longer than 19 digits) THEN returns empty results', () => {
			const result = utils.extractDetailedMentions(
				'<#54173919177657550212> <@&54173919177657550212> <@54173919177657550212> <@!54173919177657550212>'
			);
			expect(result.channels.size).toBe(0);
			expect(result.roles.size).toBe(0);
			expect(result.users.size).toBe(0);
			expect(result.parse).toStrictEqual([]);
		});

		test('GIVEN a role, a channel, and a user mention THEN returns one ID for each', () => {
			const result = utils.extractDetailedMentions(
				'<@268792781713965056> sent a message in <#541740581832097792> mentioning <@&541739191776575502>!'
			);
			expect([...result.channels]).toStrictEqual(['541740581832097792']);
			expect([...result.roles]).toStrictEqual(['541739191776575502']);
			expect([...result.users]).toStrictEqual(['268792781713965056']);
			expect(result.parse).toStrictEqual([]);
		});

		test('GIVEN a role, a channel, a user, and an everyone mention THEN returns one ID for each', () => {
			const result = utils.extractDetailedMentions(
				'<@268792781713965056> sent a message in <#541740581832097792> mentioning <@&541739191776575502>! @everyone'
			);
			expect([...result.channels]).toStrictEqual(['541740581832097792']);
			expect([...result.roles]).toStrictEqual(['541739191776575502']);
			expect([...result.users]).toStrictEqual(['268792781713965056']);
			expect(result.parse).toStrictEqual(['everyone']);
		});
	});

	describe('getContent', () => {
		test('GIVEN content THEN returns content', () => {
			expect(
				utils.getContent({
					content: 'Something',
					embeds: []
				} as unknown as Message)
			).toEqual('Something');
		});

		test('GIVEN description in embed THEN returns description', () => {
			expect(
				utils.getContent({
					content: '',
					embeds: [createEmbed({ description: 'Hey there!' })]
				} as unknown as Message)
			).toEqual('Hey there!');
		});

		test('GIVEN field value in embed THEN returns field value', () => {
			expect(
				utils.getContent({
					content: '',
					embeds: [createEmbed({ fields: [{ name: 'Name', value: 'Value' }] })]
				} as unknown as Message)
			).toEqual('Value');
		});

		test('GIVEN no detectable content THEN returns null', () => {
			expect(
				utils.getContent({
					content: '',
					embeds: [createEmbed({})]
				} as unknown as Message)
			).toEqual(null);
		});
	});

	describe('getImage', () => {
		const _Query = new URLSearchParams({
			ex: '651c15b6',
			is: '651ac436',
			hm: 'b0227f7dce067d2f83880cd01f59a5856885af9204940f8c666dd81f257796c6'
		}).toString();

		function createAttachment(data: APIAttachment): Attachment {
			return Reflect.construct(Attachment, [data]);
		}

		function createAttachments(attachment?: Attachment | undefined) {
			const collection = new Collection<string, Attachment>();
			if (attachment) collection.set(attachment.id, attachment);
			return collection;
		}

		function makeEmbed(name: 'image' | 'thumbnail'): Embed {
			return createEmbed({
				[name]: {
					url: `https://cdn.discordapp.com/attachments/222222222222222222/222222222222222222/image.png?${_Query}&`,
					proxy_url: `https://media.discordapp.net/attachments/222222222222222222/222222222222222222/image.png?${_Query}&`,
					width: 32,
					height: 32
				}
			});
		}

		function getImage(message: DeepPartial<Message>) {
			// @ts-expect-error We're only passing partial data to not mock an entire message
			return utils.getImage(message);
		}

		describe.each`
			embed          | description
			${null}        | ${'no embeds'}
			${'image'}     | ${'image embed'}
			${'thumbnail'} | ${'thumbnail embed'}
		`('GIVEN message WITH $description', ({ embed }: { embed: null | 'image' | 'thumbnail' }) => {
			const AttachmentImage = createAttachment({
				id: '1111111111111111111',
				filename: 'image.png',
				content_type: 'image/png',
				url: `https://cdn.discordapp.com/attachments/111111111111111111/111111111111111111/image.png?${_Query}&`,
				proxy_url: `https://media.discordapp.net/attachments/111111111111111111/111111111111111111/image.png?${_Query}&`,
				size: 2463,
				width: 32,
				height: 32
			} as const);
			const AttachmentText = createAttachment({
				id: '1111111111111111111',
				filename: 'text.txt',
				content_type: 'text/plain; charset=utf-8',
				url: `https://cdn.discordapp.com/attachments/111111111111111111/111111111111111111/text.txt?${_Query}&`,
				proxy_url: `https://media.discordapp.net/attachments/111111111111111111/111111111111111111/text.txt?${_Query}&`,
				size: 4
			} as const);

			const embeds: Embed[] = embed === null ? [] : [makeEmbed(embed)];
			const ExpectedEmbedImageURL = embed === null ? null : embeds[0][embed]!.proxyURL;
			const ExpectedReturn = embed === null ? 'null' : `embed ${embed} URL`;
			test.each`
				attachment         | returns             | expected                    | description
				${undefined}       | ${ExpectedReturn}   | ${ExpectedEmbedImageURL}    | ${'no attachments'}
				${AttachmentText}  | ${ExpectedReturn}   | ${ExpectedEmbedImageURL}    | ${'non-image attachment'}
				${AttachmentImage} | ${'attachment URL'} | ${AttachmentImage.proxyURL} | ${'image attachment'}
			`(`AND $description THEN returns $returns`, ({ attachment, expected }) => {
				const message: DeepPartial<Message> = { attachments: createAttachments(attachment), embeds, stickers: new Collection() };

				expect(getImage(message)).toEqual(expected);
			});
		});
	});

	describe('parseRange', () => {
		test('GIVEN 1..5 THEN returns [1, 2, 3, 4, 5]', () => {
			expect(utils.parseRange('1..5')).toStrictEqual([1, 2, 3, 4, 5]);
		});

		test('GIVEN 1..5,10 THEN returns [1, 2, 3, 4, 5, 10]', () => {
			expect(utils.parseRange('1..5,10')).toStrictEqual([1, 2, 3, 4, 5, 10]);
		});

		test('GIVEN 1..5,10..12 THEN returns [1, 2, 3, 4, 5, 10, 11, 12]', () => {
			expect(utils.parseRange('1..5,10..12')).toStrictEqual([1, 2, 3, 4, 5, 10, 11, 12]);
		});

		test('GIVEN 20..22,10..12,10..15,60..57 THEN [20, 21, 22, 10, 11, 12, 13, 14, 15, 57, 58, 59, 60]', () => {
			expect(utils.parseRange('20..22,10..12,10..15,60..57')).toStrictEqual([20, 21, 22, 10, 11, 12, 13, 14, 15, 57, 58, 59, 60]);
		});

		test('GIVEN 1,2,2,2,1..2,2,2..1 THEN returns [1, 2]', () => {
			expect(utils.parseRange('1,2,2,2,1..2,2,2..1')).toStrictEqual([1, 2]);
		});

		test('GIVEN 1..3,2,6,0,9 THEN returns [1, 2, 3, 6, 9]', () => {
			expect(utils.parseRange('1..3,2,6,0,9')).toStrictEqual([1, 2, 3, 6, 9]);
		});

		test('GIVEN 1,2,3,6,10,12 THEN returns [1, 2, 3, 6, 10, 12]', () => {
			expect(utils.parseRange('1,2,3,6,10,12')).toStrictEqual([1, 2, 3, 6, 10, 12]);
		});

		test('GIVEN 1,   2, 3,   6, THEN returns [1, 2, 3, 6]', () => {
			expect(utils.parseRange('1,   2, 3,   6,')).toStrictEqual([1, 2, 3, 6]);
		});

		test('GIVEN 1,..,,   2, 3,   6, THEN returns [1, 2, 3, 6]', () => {
			expect(utils.parseRange('1,..,,   2, 3,   6,')).toStrictEqual([1, 2, 3, 6]);
		});

		test('GIVEN 1,..,,   2, 3, ..  6, THEN returns [1, 2, 3]', () => {
			expect(utils.parseRange('1,..,,   2, 3, ..  6,')).toStrictEqual([1, 2, 3]);
		});

		test('GIVEN 1,..,,   2, 3,4 ..  6, THEN returns [1, 2, 3, 4, 5, 6]', () => {
			expect(utils.parseRange('1,..,,   2, 3,4 ..  6,')).toStrictEqual([1, 2, 3, 4, 5, 6]);
		});
	});

	describe('getImageUrl', () => {
		test('GIVEN valid Image Url THEN returns Image Url', () => {
			const url = 'https://example.com/image.png';
			expect(utils.getImageUrl(url)).toBe(url);
		});

		test('GIVEN valid Image Url WHEN with queryparameters THEN returns Image Url', () => {
			const url = 'https://example.com/image.png?test=hehehehe';
			expect(utils.getImageUrl(url)).toBe(url);
		});

		test('GIVEN invalid Image Url THEN returns undefined', () => {
			expect(utils.getImageUrl('https://example.com/image.mp4')).toBe(undefined);
		});

		test('GIVEN invalid Url THEN returns undefined', () => {
			expect(utils.getImageUrl('something/image.mp4')).toBe(undefined);
		});
	});

	describe('pickRandom', () => {
		beforeAll(() => {
			// Mock out random so the result is predictable
			vi.spyOn(Math, 'random').mockReturnValue(0.123456789);
		});

		afterAll(() => {
			(Math.random as any).mockRestore();
		});

		test('GIVEN simple picker THEN picks first value', () => {
			const randomEntry = utils.pickRandom([1, 2, 3, 4]);
			expect(randomEntry).toEqual(1);
		});
	});

	describe('shuffle', () => {
		test('GIVEN an array, shuffles it properly', () => {
			const array = [0, 1, 2, 3, 4, 5];
			const shuffled = utils.shuffle(array.slice());
			expect(shuffled.length).toBe(array.length);
			expect(array === shuffled).toBe(false);
		});
	});

	describe('random', () => {
		test('GIVEN 2 calls to random THEN returns floored mocked values', () => {
			const spy = vi.spyOn(Math, 'random').mockReturnValue(0.6);
			expect(utils.random(50)).toEqual(30);
			spy.mockRestore();
		});
	});

	describe('getDisplayAvatar', () => {
		test('GIVEN user without avatar THEN returns base avatar', () => {
			const user = createUser({
				discriminator: '0001',
				avatar: null
			});

			expect(utils.getDisplayAvatar(user)).toEqual('https://cdn.discordapp.com/embed/avatars/1.png');
		});

		test('GIVEN user without avatar THEN returns base avatar', () => {
			const user = createUser({
				discriminator: '0',
				avatar: null
			});

			expect(utils.getDisplayAvatar(user)).toEqual('https://cdn.discordapp.com/embed/avatars/1.png');
		});

		test('GIVEN user with animated avatar THEN avatar gif url', () => {
			const user = createUser({
				discriminator: '0001',
				avatar: 'a_e583ad02d90ca9a5431bccec6c17b348'
			});

			expect(utils.getDisplayAvatar(user)).toEqual(
				'https://cdn.discordapp.com/avatars/266624760782258186/a_e583ad02d90ca9a5431bccec6c17b348.gif'
			);
		});

		test('GIVEN user with static avatar THEN avatar png url', () => {
			const user = createUser({
				discriminator: '0001',
				avatar: '09b52e547fa797c47c7877cd10eb6ba8'
			});

			expect(utils.getDisplayAvatar(user)).toEqual(
				'https://cdn.discordapp.com/avatars/266624760782258186/09b52e547fa797c47c7877cd10eb6ba8.webp'
			);
		});

		test('GIVEN user with static avatar AND options.format=png THEN avatar png url', () => {
			const user = createUser({
				discriminator: '0001',
				avatar: '09b52e547fa797c47c7877cd10eb6ba8'
			});

			expect(utils.getDisplayAvatar(user, { extension: 'png' })).toEqual(
				'https://cdn.discordapp.com/avatars/266624760782258186/09b52e547fa797c47c7877cd10eb6ba8.png'
			);
		});

		test('GIVEN user with animated avatar AND format "png" THEN avatar png url', () => {
			const user = createUser({
				discriminator: '0001',
				avatar: 'a_e583ad02d90ca9a5431bccec6c17b348'
			});

			expect(utils.getDisplayAvatar(user, { extension: 'png' })).toEqual(
				'https://cdn.discordapp.com/avatars/266624760782258186/a_e583ad02d90ca9a5431bccec6c17b348.gif'
			);
		});

		test('GIVEN user with animated avatar AND format "png" AND forceStatic THEN avatar png url', () => {
			const user = createUser({
				discriminator: '0001',
				avatar: 'a_e583ad02d90ca9a5431bccec6c17b348'
			});

			expect(utils.getDisplayAvatar(user, { extension: 'png', forceStatic: true })).toEqual(
				'https://cdn.discordapp.com/avatars/266624760782258186/a_e583ad02d90ca9a5431bccec6c17b348.png'
			);
		});

		test('GIVEN user with animated avatar AND options.size=2048 THEN sized avatar gif url', () => {
			const user = createUser({
				discriminator: '0001',
				avatar: 'a_e583ad02d90ca9a5431bccec6c17b348'
			});

			expect(utils.getDisplayAvatar(user, { size: 2048 })).toEqual(
				'https://cdn.discordapp.com/avatars/266624760782258186/a_e583ad02d90ca9a5431bccec6c17b348.gif?size=2048'
			);
		});
	});
});
