import { CustomCommand, DbSet, GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { parse as parseColour } from '#utils/Color';
import { requiresLevel, requiresPermissions } from '#utils/decorators';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { chunk, codeBlock, cutText } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['tags', 'customcommand', 'copypasta'],
	description: LanguageKeys.Commands.Tags.TagDescription,
	extendedHelp: LanguageKeys.Commands.Tags.TagExtended,
	runIn: ['text'],
	strategyOptions: { flags: ['embed'], options: ['color', 'colour'] },
	permissions: ['MANAGE_MESSAGES'],
	subCommands: ['add', 'remove', 'edit', 'source', 'list', 'reset', { input: 'show', default: true }]
})
export class UserCommand extends SkyraCommand {
	// Based on HEX regex from #utils/Color
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#kHexlessRegex = /^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/i;

	@requiresLevel(PermissionLevels.Moderator, async (_: GuildMessage, args: SkyraCommand.Args) => {
		throw args.t(LanguageKeys.Commands.Tags.TagPermissionLevel);
	})
	public async add(message: GuildMessage, args: SkyraCommand.Args) {
		const id = (await args.pick('string')).toLowerCase();
		const content = await args.rest('string');

		await message.guild.writeSettings((settings) => {
			if (settings[GuildSettings.CustomCommands].some((command) => command.id === id))
				throw args.t(LanguageKeys.Commands.Tags.TagExists, { tag: id });

			settings[GuildSettings.CustomCommands].push(this.createTag(args, id, content));
		});

		return message.send(args.t(LanguageKeys.Commands.Tags.TagAdded, { name: id, content: cutText(content, 1850) }));
	}

	@requiresLevel(PermissionLevels.Moderator, async (_: GuildMessage, args: SkyraCommand.Args) => {
		throw args.t(LanguageKeys.Commands.Tags.TagPermissionLevel);
	})
	public async remove(message: GuildMessage, args: SkyraCommand.Args) {
		const id = (await args.pick('string')).toLowerCase();

		await message.guild.writeSettings((settings) => {
			const tagIndex = settings[GuildSettings.CustomCommands].findIndex((command) => command.id === id);
			if (tagIndex === -1) throw args.t(LanguageKeys.Commands.Tags.TagNotExists, { tag: id });

			settings[GuildSettings.CustomCommands].splice(tagIndex, 1);
		});

		return message.send(args.t(LanguageKeys.Commands.Tags.TagRemoved, { name: id }));
	}

	@requiresLevel(PermissionLevels.Moderator, async (_: GuildMessage, args: SkyraCommand.Args) => {
		throw args.t(LanguageKeys.Commands.Tags.TagPermissionLevel);
	})
	public async reset(message: GuildMessage) {
		await message.guild.writeSettings((settings) => {
			settings[GuildSettings.CustomCommands].length = 0;
		});

		return message.sendTranslated(LanguageKeys.Commands.Tags.TagReset);
	}

	@requiresLevel(PermissionLevels.Moderator, async (_: GuildMessage, args: SkyraCommand.Args) => {
		throw args.t(LanguageKeys.Commands.Tags.TagPermissionLevel);
	})
	public async edit(message: GuildMessage, args: SkyraCommand.Args) {
		const id = (await args.pick('string')).toLowerCase();
		const content = await args.rest('string');

		await message.guild.writeSettings((settings) => {
			const tagIndex = settings[GuildSettings.CustomCommands].findIndex((command) => command.id === id);
			if (tagIndex === -1) throw args.t(LanguageKeys.Commands.Tags.TagNotExists, { tag: id });

			settings[GuildSettings.CustomCommands].splice(tagIndex, 1, this.createTag(args, id, content));
		});

		return message.send(args.t(LanguageKeys.Commands.Tags.TagEdited, { name: id, content: cutText(content, 1000) }));
	}

	@requiresPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	public async list(message: GuildMessage) {
		// Get tags, prefix, and language
		const [tags, prefix, t] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.CustomCommands],
			settings[GuildSettings.Prefix],
			settings.getLanguage()
		]);
		if (!tags.length) throw t(LanguageKeys.Commands.Tags.TagListEmpty);

		const response = await sendLoadingMessage(message, t);

		// Get prefix and display all tags
		const display = new UserPaginatedMessage({ template: new MessageEmbed().setColor(await DbSet.fetchColor(message)) });

		// Add all pages, containing 30 tags each
		for (const page of chunk(tags, 30)) {
			const description = `\`${page.map((command) => `${prefix}${command.id}`).join('`, `')}\``;
			display.addPageEmbed((embed) => embed.setDescription(description));
		}

		// Run the display
		await display.start(response as GuildMessage, message.author);
		return response;
	}

	@requiresPermissions(['EMBED_LINKS'])
	public async show(message: GuildMessage, [tagName]: [string]) {
		const tags = await message.guild.readSettings(GuildSettings.CustomCommands);
		const tag = tags.find((command) => command.id === tagName);
		return tag
			? tag.embed
				? message.send(new MessageEmbed().setDescription(tag.content).setColor(tag.color))
				: message.send(tag.content)
			: null;
	}

	public async source(message: GuildMessage, [tagName]: [string]) {
		const tags = await message.guild.readSettings(GuildSettings.CustomCommands);
		const tag = tags.find((command) => command.id === tagName);
		return tag ? message.send(codeBlock('md', tag.content)) : null;
	}

	private createTag(args: SkyraCommand.Args, id: string, content: string): CustomCommand {
		const embed = args.getFlags('embed');
		return {
			id,
			content,
			embed,
			color: embed ? this.parseColour(args) : 0,
			args: []
		};
	}

	private parseColour(args: SkyraCommand.Args) {
		let color = args.getOption('color', 'colour');

		if (color === null) return 0;

		const number = Number(color);
		if (Number.isSafeInteger(number)) return Math.max(Math.min(number, 0xffffff), 0x000000);
		if (this.#kHexlessRegex.test(color)) color = `#${color}`;

		try {
			return parseColour(color).b10.value;
		} catch (err) {
			return 0;
		}
	}
}
