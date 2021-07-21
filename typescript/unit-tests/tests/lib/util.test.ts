import * as utils from '#utils/util';
import Collection from '@discordjs/collection';
import { Time } from '@sapphire/time-utilities';
import type { DeepPartial } from '@sapphire/utilities';
import { Message, MessageAttachment, MessageEmbed } from 'discord.js';
import { readFile } from 'fs/promises';
import { mockRandom, resetMockRandom } from 'jest-mock-random';
import { resolve } from 'path';

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

	describe('radians', () => {
		test('GIVEN 180 degrees THEN returns 1 Pi', () => {
			expect(utils.radians(180)).toEqual(Math.PI);
		});

		test('GIVEN 120 degrees THEN returns ⅔ Pi', () => {
			expect(utils.radians(120)).toEqual((Math.PI / 3) * 2);
		});

		test('GIVEN 360 degrees THEN returns 2 Pi', () => {
			expect(utils.radians(360)).toEqual(Math.PI * 2);
		});
	});

	describe('showSeconds', () => {
		test('GIVEN duration of string THEN returns 00:00', () => {
			// @ts-expect-error Testing the error case
			expect(utils.showSeconds('I am your father')).toEqual('00:00');
		});

		test('GIVEN duration of number THEN returns seconds', () => {
			expect(utils.showSeconds(Number(Time.Day))).toEqual('24:00:00');
		});

		test('GIVEN duration of number THEN returns seconds', () => {
			expect(utils.showSeconds(Number(Time.Second))).toEqual('00:01');
		});
	});

	describe('resolveEmoji', () => {
		test('Full animated emoji', () => {
			expect(utils.resolveEmoji('<a:emoji:123456789101213145>')).toEqual('a:emoji:123456789101213145');
		});

		test('Full static emoji', () => {
			expect(utils.resolveEmoji('<:emoji:123456789101213145>')).toEqual(':emoji:123456789101213145');
		});

		test('Partial animated emoji', () => {
			expect(utils.resolveEmoji('a:emoji:123456789101213145')).toEqual('a:emoji:123456789101213145');
		});

		test('Partial static emoji', () => {
			expect(utils.resolveEmoji(':emoji:123456789101213145')).toEqual(':emoji:123456789101213145');
		});

		test('Box Emoji', () => {
			expect(utils.resolveEmoji('5\u20E3')).toEqual('5%E2%83%A3');
		});

		test('Twemoji Emoji', () => {
			expect(utils.resolveEmoji('😂')).toEqual('%F0%9F%98%82');
		});

		test('None emoji', () => {
			expect(utils.resolveEmoji('')).toBeNull();
		});

		test('GIVEN Animated Emoji Object THEN returns string references', () => {
			const emoji: utils.EmojiObject = {
				name: 'joy',
				id: '123-456-789',
				animated: true
			};

			expect(utils.resolveEmoji(emoji)).toEqual('a:joy:123-456-789');
		});

		test('GIVEN Static Emoji Object THEN returns string references', () => {
			const emoji: utils.EmojiObject = {
				name: 'joy',
				id: '123-456-789',
				animated: false
			};

			expect(utils.resolveEmoji(emoji)).toEqual(':joy:123-456-789');
		});

		test('GIVEN Emoji Object without ID THEN returns string references', () => {
			const emoji: utils.EmojiObject = {
				name: 'joy',
				id: null,
				animated: false
			};

			expect(utils.resolveEmoji(emoji)).toEqual('joy');
		});
	});

	describe('displayEmoji', () => {
		test('GIVEN custom emoji THEN returns emoji+id', () => {
			expect(utils.displayEmoji(':emoji:123456789101213145')).toEqual('<:emoji:123456789101213145>');
		});

		test('GIVEN twemoji THEN returns decoded URI Component', () => {
			expect(utils.displayEmoji('🤖')).toEqual('🤖');
		});
	});

	describe('compareEmoji', () => {
		test('GIVEN custom emoji with Emoji string THEN returns true', () => {
			expect(utils.compareEmoji(':emoji:123456789101213145', ':emoji:123456789101213145')).toEqual(true);
		});

		test('GIVEN custom emoji with non matching id THEN returns false', () => {
			expect(utils.compareEmoji(':emoji:123456789101213145', ':emoji:541312101987654321')).toEqual(false);
		});

		test('GIVEN custom emoji with non matching name THEN returns false', () => {
			expect(utils.compareEmoji(':emoji:123456789101213145', ':joy:123456789101213145')).toEqual(false);
		});

		test('GIVEN custom emoji with EmojiObjectPartial THEN compares to matching', () => {
			const emoji: utils.EmojiObjectPartial = {
				name: 'joy',
				id: '123456789101213145'
			};

			expect(utils.compareEmoji(':joy:123456789101213145', emoji)).toEqual(true);
		});

		test('GIVEN custom emoji with non matching EmojiObjectPartial THEN compares to matching', () => {
			const emoji: utils.EmojiObjectPartial = {
				name: 'joy',
				id: '123456789101213145'
			};

			expect(utils.compareEmoji(':joy:541312101987654321', emoji)).toEqual(false);
		});

		test('GIVEN custom emoji with non matching EmojiObjectPartial THEN compares to matching', () => {
			const emoji: utils.EmojiObjectPartial = {
				name: 'emoji',
				id: '123456789101213145'
			};

			expect(utils.compareEmoji(':joy:123456789101213145', emoji)).toEqual(false);
		});

		test('GIVEN regular emoji with matching emoji THEN compares to matching', () => {
			expect(utils.compareEmoji('%F0%9F%98%82', '😂')).toEqual(true);
		});

		test('GIVEN regular emoji with non-matching emoji THEN compares to matching', () => {
			expect(utils.compareEmoji('%F0%9F%98%82', '😀')).toEqual(false);
		});

		test('GIVEN regular emoji with non-matching emoji THEN compares to matching', () => {
			const emoji: utils.EmojiObjectPartial = {
				name: 'emoji',
				id: '123456789101213145'
			};

			expect(utils.compareEmoji('%F0%9F%98%82', emoji)).toEqual(false);
		});

		test('GIVEN regular emoji matching against custom emoji THEN compares to matching', () => {
			expect(utils.compareEmoji(':emoji:541312101987654321', '😀')).toEqual(false);
		});
	});

	describe('oneToTen', () => {
		test('GIVEN positive rational number THEN returns level 0 (😪)', () => {
			expect(utils.oneToTen(2 / 3)).toStrictEqual({ color: 5968128, emoji: '😪' });
		});

		test('GIVEN negative rational number THEN returns level 0 (😪)', () => {
			expect(utils.oneToTen(2 / 3)).toStrictEqual({ color: 5968128, emoji: '😪' });
		});

		test('GIVEN positive integer number THEN returns level 2 (😫)', () => {
			expect(utils.oneToTen(2)).toStrictEqual({ color: 11211008, emoji: '😫' });
		});

		test('GIVEN negative integer number THEN returns level 0 (😪)', () => {
			expect(utils.oneToTen(-5)).toStrictEqual({ color: 5968128, emoji: '😪' });
		});

		test('GIVEN positive integer over 10 THEN returns level 10 (😍)', () => {
			expect(utils.oneToTen(11)).toStrictEqual({ color: 5362927, emoji: '😍' });
		});
	});

	describe('extractDetailedMentions', () => {
		test('GIVEN empty string THEN returns empty results', () => {
			const result = utils.extractDetailedMentions('');
			expect(result.channels.size).toBe(0);
			expect(result.roles.size).toBe(0);
			expect(result.users.size).toBe(0);
		});

		test('GIVEN a user mention THEN returns one user ID', () => {
			const result = utils.extractDetailedMentions('<@242043489611808769>');
			expect(result.channels.size).toBe(0);
			expect(result.roles.size).toBe(0);
			expect([...result.users]).toStrictEqual(['242043489611808769']);
		});

		test('GIVEN a member mention THEN returns one user ID', () => {
			const result = utils.extractDetailedMentions('<@!242043489611808769>');
			expect(result.channels.size).toBe(0);
			expect(result.roles.size).toBe(0);
			expect([...result.users]).toStrictEqual(['242043489611808769']);
		});

		test('GIVEN a duplicated user mention THEN returns only one user ID', () => {
			const result = utils.extractDetailedMentions('<@242043489611808769> <@!242043489611808769>');
			expect(result.channels.size).toBe(0);
			expect(result.roles.size).toBe(0);
			expect([...result.users]).toStrictEqual(['242043489611808769']);
		});

		test('GIVEN a channel mention THEN returns one channel ID', () => {
			const result = utils.extractDetailedMentions('<#541740581832097792>');
			expect([...result.channels]).toStrictEqual(['541740581832097792']);
			expect(result.roles.size).toBe(0);
			expect(result.users.size).toBe(0);
		});

		test('GIVEN a duplicated channel mention THEN returns only one channel ID', () => {
			const result = utils.extractDetailedMentions('<#541740581832097792> <#541740581832097792>');
			expect([...result.channels]).toStrictEqual(['541740581832097792']);
			expect(result.roles.size).toBe(0);
			expect(result.users.size).toBe(0);
		});

		test('GIVEN a role mention THEN returns one role ID', () => {
			const result = utils.extractDetailedMentions('<@&541739191776575502>');
			expect(result.channels.size).toBe(0);
			expect([...result.roles]).toStrictEqual(['541739191776575502']);
			expect(result.users.size).toBe(0);
		});

		test('GIVEN a duplicated role mention THEN returns only one role ID', () => {
			const result = utils.extractDetailedMentions('<@&541739191776575502> <@&541739191776575502>');
			expect(result.channels.size).toBe(0);
			expect([...result.roles]).toStrictEqual(['541739191776575502']);
			expect(result.users.size).toBe(0);
		});

		test('GIVEN invalid mentions (ID shorter than 17 digits) THEN returns empty results', () => {
			const result = utils.extractDetailedMentions('<#5417391917765755> <@&5417391917765755> <@5417391917765755> <@!5417391917765755>');
			expect(result.channels.size).toBe(0);
			expect(result.roles.size).toBe(0);
			expect(result.users.size).toBe(0);
		});

		test('GIVEN invalid mentions (ID longer than 19 digits) THEN returns empty results', () => {
			const result = utils.extractDetailedMentions(
				'<#54173919177657550212> <@&54173919177657550212> <@54173919177657550212> <@!54173919177657550212>'
			);
			expect(result.channels.size).toBe(0);
			expect(result.roles.size).toBe(0);
			expect(result.users.size).toBe(0);
		});

		test('GIVEN a role, a channel, and a user mention THEN returns one ID for each', () => {
			const result = utils.extractDetailedMentions(
				'<@268792781713965056> sent a message in <#541740581832097792> mentioning <@&541739191776575502>!'
			);
			expect([...result.channels]).toStrictEqual(['541740581832097792']);
			expect([...result.roles]).toStrictEqual(['541739191776575502']);
			expect([...result.users]).toStrictEqual(['268792781713965056']);
		});
	});

	describe('twemoji', () => {
		test('GIVEN twemoji icon THEN returns identifier for maxcdn', () => {
			expect(utils.twemoji('😀')).toEqual('1f600');
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
					embeds: [new MessageEmbed().setDescription('Hey there!')]
				} as unknown as Message)
			).toEqual('Hey there!');
		});

		test('GIVEN field value in embed THEN returns field value', () => {
			expect(
				utils.getContent({
					content: '',
					embeds: [new MessageEmbed().addField('Name', 'Value')]
				} as unknown as Message)
			).toEqual('Value');
		});

		test('GIVEN no detectable content THEN returns null', () => {
			expect(
				utils.getContent({
					content: '',
					embeds: [new MessageEmbed()]
				} as unknown as Message)
			).toEqual(null);
		});
	});

	describe('getAllContent', () => {
		test('GIVEN content THEN returns content', () => {
			expect(
				utils.getAllContent({
					content: 'Something',
					embeds: []
				} as unknown as Message)
			).toEqual('Something');
		});

		test('GIVEN description in embed THEN returns description', () => {
			expect(
				utils.getAllContent({
					content: '',
					embeds: [new MessageEmbed().setDescription('Hey there!')]
				} as unknown as Message)
			).toEqual('Hey there!');
		});

		test('GIVEN field value in embed THEN returns field value', () => {
			expect(
				utils.getAllContent({
					content: '',
					embeds: [new MessageEmbed().addField('Name', 'Value')]
				} as unknown as Message)
			).toEqual('Name\nValue');
		});

		test('GIVEN no detectable content THEN returns null', () => {
			expect(
				utils.getAllContent({
					content: '',
					embeds: [new MessageEmbed()]
				} as unknown as Message)
			).toEqual('');
		});

		test('GIVEN content and description in embed THEN returns both', () => {
			expect(
				utils.getAllContent({
					content: 'Something',
					embeds: [new MessageEmbed().setDescription('Hey there!')]
				} as unknown as Message)
			).toEqual('Something\nHey there!');
		});

		test('GIVEN content and author in embed THEN returns both', () => {
			expect(
				utils.getAllContent({
					content: 'Something',
					embeds: [new MessageEmbed().setAuthor('Some author!')]
				} as unknown as Message)
			).toEqual('Something\nSome author!');
		});

		test('GIVEN content and title in embed THEN returns both', () => {
			expect(
				utils.getAllContent({
					content: 'Something',
					embeds: [new MessageEmbed().setTitle('Some title!')]
				} as unknown as Message)
			).toEqual('Something\nSome title!');
		});

		test('GIVEN description and footer in embed THEN returns both', () => {
			expect(
				utils.getAllContent({
					content: '',
					embeds: [new MessageEmbed().setDescription('Description!').setFooter('Some footer!')]
				} as unknown as Message)
			).toEqual('Description!\nSome footer!');
		});

		test('GIVEN two embeds THEN returns both', () => {
			expect(
				utils.getAllContent({
					content: '',
					embeds: [
						new MessageEmbed().setDescription('Description!').setFooter('Some footer!'),
						new MessageEmbed().setDescription('Other embed!').setFooter('Another footer!')
					]
				} as unknown as Message)
			).toEqual('Description!\nSome footer!\nOther embed!\nAnother footer!');
		});
	});

	describe('getImage', () => {
		test('GIVEN message w/ attachments w/ image w/o proxyURL attachment THEN returns url', async () => {
			const filePath = resolve(__dirname, '..', 'mocks', 'image.png');
			const buffer = await readFile(filePath);
			const fakeAttachment = new MessageAttachment(buffer, 'image.png');
			fakeAttachment.url = filePath;
			fakeAttachment.height = 32;
			fakeAttachment.width = 32;

			const fakeMessage: DeepPartial<Message> = {
				attachments: new Collection<string, MessageAttachment>([['image.png', fakeAttachment]]),
				embeds: []
			};

			// @ts-expect-error We're only passing partial data to not mock an entire message
			expect(utils.getImage(fakeMessage)).toEqual(filePath);
		});

		test('GIVEN message w/ attachments w/ image w/ proxyURL attachment THEN returns url', async () => {
			const filePath = resolve(__dirname, '..', 'mocks', 'image.png');
			const buffer = await readFile(filePath);
			const fakeAttachment = new MessageAttachment(buffer, 'image.png');
			fakeAttachment.url = filePath;
			fakeAttachment.proxyURL = filePath;
			fakeAttachment.height = 32;
			fakeAttachment.width = 32;

			const fakeMessage: DeepPartial<Message> = {
				attachments: new Collection<string, MessageAttachment>([['image.png', fakeAttachment]]),
				embeds: []
			};

			// @ts-expect-error We're only passing partial data to not mock an entire message
			expect(utils.getImage(fakeMessage)).toEqual(filePath);
		});

		test('GIVEN message w/ attachments w/o image attachment THEN passes through to embed checking', async () => {
			const filePath = resolve(__dirname, '..', 'mocks', 'image.png');
			const buffer = await readFile(filePath);
			const fakeAttachment = new MessageAttachment(buffer, 'image.png');
			fakeAttachment.url = 'not_an_image';
			fakeAttachment.proxyURL = 'not_an_image';
			fakeAttachment.height = 32;
			fakeAttachment.width = 32;

			const fakeMessage: DeepPartial<Message> = {
				attachments: new Collection<string, MessageAttachment>([['image.png', fakeAttachment]]),
				embeds: [
					{
						type: 'image',
						thumbnail: { url: 'image.png', proxyURL: 'image.png', height: 32, width: 32 }
					}
				]
			};

			// @ts-expect-error We're only passing partial data to not mock an entire message
			expect(utils.getImage(fakeMessage)).toEqual('image.png');
		});

		test('GIVEN message w/o attachments w/ embed type === image THEN returns embedded image url', () => {
			const fakeMessage: DeepPartial<Message> = {
				attachments: new Collection<string, MessageAttachment>(),
				embeds: [
					{
						type: 'image',
						thumbnail: { url: 'image.png', proxyURL: 'image.png', height: 32, width: 32 }
					}
				]
			};

			// @ts-expect-error We're only passing partial data to not mock an entire message
			expect(utils.getImage(fakeMessage)).toEqual('image.png');
		});

		test('GIVEN message w/o attachments w/ embed w/ image THEN returns embedded image url', () => {
			const fakeMessage: DeepPartial<Message> = {
				attachments: new Collection<string, MessageAttachment>(),
				embeds: [
					{
						type: 'not_image',
						image: { url: 'image.png', proxyURL: 'image.png', height: 32, width: 32 }
					}
				]
			};

			// @ts-expect-error We're only passing partial data to not mock an entire message
			expect(utils.getImage(fakeMessage)).toEqual('image.png');
		});

		test('GIVEN message w/o attachments w/ embed w/o image THEN returns null', () => {
			const fakeMessage: DeepPartial<Message> = {
				attachments: new Collection<string, MessageAttachment>(),
				embeds: [
					{
						type: 'not_image',
						image: undefined
					}
				]
			};

			// @ts-expect-error We're only passing partial data to not mock an entire message
			expect(utils.getImage(fakeMessage)).toBeNull();
		});

		test('GIVEN message w/o attachments w/o embed THEN returns null', () => {
			const fakeMessage: DeepPartial<Message> = {
				attachments: new Collection<string, MessageAttachment>(),
				embeds: []
			};

			// @ts-expect-error We're only passing partial data to not mock an entire message
			expect(utils.getImage(fakeMessage)).toBeNull();
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

	describe('createPick', () => {
		beforeAll(() => {
			// Mock out random so the result is predictable
			jest.spyOn(global.Math, 'random').mockReturnValue(0.123456789);
		});

		afterAll(() => {
			(global.Math.random as any).mockRestore();
		});

		test('GIVEN simple picker THEN picks first value', () => {
			const picker = utils.createPick([1, 2, 3, 4]);
			expect(picker()).toEqual(1);
		});
	});

	describe('pickRandom', () => {
		beforeAll(() => {
			// Mock out random so the result is predictable
			jest.spyOn(global.Math, 'random').mockReturnValue(0.123456789);
		});

		afterAll(() => {
			(global.Math.random as any).mockRestore();
		});

		test('GIVEN simple picker THEN picks first value', () => {
			const randomEntry = utils.pickRandom([1, 2, 3, 4]);
			expect(randomEntry).toEqual(1);
		});
	});

	describe('getFromPath', () => {
		const obj = {
			keyOne: 'valueOne',
			keyTwo: {
				nestedKeyOne: 'nestedValueOne'
			}
		};

		test('GIVEN object and existing root level key THEN returns value', () => {
			expect(utils.getFromPath(obj, 'keyOne')).toEqual('valueOne');
		});

		test('GIVEN object and non-existing root level key THEN returns undefined', () => {
			expect(utils.getFromPath(obj, 'keyThree')).toBeUndefined();
		});

		test('GIVEN object and existing nested level key THEN returns value', () => {
			expect(utils.getFromPath(obj, 'keyTwo.nestedKeyOne')).toEqual('nestedValueOne');
		});

		test('GIVEN object and non-existing nested level key THEN returns undefined', () => {
			expect(utils.getFromPath(obj, 'keyTwo.nestedKeyTwo')).toBeUndefined();
		});

		test('GIVEN object and string array path THEN returns undefined', () => {
			expect(utils.getFromPath(obj, ['keyTwo', 'nestedKeyOne'])).toEqual('nestedValueOne');
		});
	});

	describe('gql', () => {
		test('GIVEN gql tag THEN returns unmodified code', () => {
			expect(utils.gql`
			fragment one on two {
				one
				two
			}`).toEqual(`
			fragment one on two {
				one
				two
			}`);
		});

		test('GIVEN nested gql tag THEN returns unmodified code', () => {
			const nestableCode = utils.gql`
				fragment two on three {
					three
					four
				}`;

			expect(utils.gql`
			${nestableCode}
			fragment one on two {
				one
				two
			}`).toEqual(`
			${nestableCode}
			fragment one on two {
				one
				two
			}`);
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
			mockRandom(0.6);
			expect(utils.random(50)).toEqual(30);
			resetMockRandom();
		});
	});
});
