// Copyright (c) 2018 BDISTIN. All rights reserved. MIT license.
// Source: https://github.com/KlasaCommunityPlugins/tags

import { CustomCommand, DbSet, GuildSettings } from '@lib/database';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { GuildMessage } from '@lib/types';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { chunk, codeBlock, cutText } from '@sapphire/utilities';
import { ApplyOptions, CreateResolvers, requiredPermissions, requiresPermission } from '@skyra/decorators';
import { parse as parseColour } from '@utils/Color';
import { BrandingColors } from '@utils/constants';
import { pickRandom } from '@utils/util';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['tags', 'customcommand', 'copypasta'],
	description: (language) => language.get(LanguageKeys.Commands.Tags.TagDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Tags.TagExtended),
	runIn: ['text'],
	subcommands: true,
	flagSupport: true,
	requiredPermissions: ['MANAGE_MESSAGES'],
	usage: '<add|remove|edit|source|list|reset|show:default> (tag:tagname) [content:...string]',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'tagname',
		async (arg, possible, message, [action]) => {
			if (action === 'list' || action === 'reset') return undefined;
			if (!arg) throw message.fetchLocale(LanguageKeys.Resolvers.InvalidString, { name: possible.name });
			return arg.toLowerCase();
		}
	]
])
export default class extends SkyraCommand {
	// Based on HEX regex from @utils/Color
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#kHexlessRegex = /^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/i;

	@requiresPermission(PermissionLevels.Moderator, async (message: GuildMessage) => {
		throw message.fetchLocale(LanguageKeys.Commands.Tags.TagPermissionlevel);
	})
	public async add(message: GuildMessage, [id, content]: [string, string]) {
		const language = await message.fetchLanguage();

		// Check for permissions and content length
		if (!content) throw language.get(LanguageKeys.Commands.Tags.TagContentRequired);

		await message.guild.writeSettings((settings) => {
			if (settings[GuildSettings.CustomCommands].some((command) => command.id === id))
				throw language.get(LanguageKeys.Commands.Tags.TagExists, { tag: id });

			settings[GuildSettings.CustomCommands].push(this.createTag(message, id, content));
		});

		return message.sendLocale(LanguageKeys.Commands.Tags.TagAdded, [{ name: id, content: cutText(content, 1850) }]);
	}

	@requiresPermission(PermissionLevels.Moderator, async (message: GuildMessage) => {
		throw message.fetchLocale(LanguageKeys.Commands.Tags.TagPermissionlevel);
	})
	public async remove(message: GuildMessage, [id]: [string]) {
		const language = await message.fetchLanguage();
		await message.guild.writeSettings((settings) => {
			const tagIndex = settings[GuildSettings.CustomCommands].findIndex((command) => command.id === id);
			if (tagIndex === -1) throw language.get(LanguageKeys.Commands.Tags.TagNotexists, { tag: id });

			settings[GuildSettings.CustomCommands].splice(tagIndex, 1);
		});

		return message.sendLocale(LanguageKeys.Commands.Tags.TagRemoved, [{ name: id }]);
	}

	@requiresPermission(PermissionLevels.Moderator, async (message: GuildMessage) => {
		throw message.fetchLocale(LanguageKeys.Commands.Tags.TagPermissionlevel);
	})
	public async reset(message: GuildMessage) {
		await message.guild.writeSettings([[GuildSettings.CustomCommands, []]]);
		return message.sendLocale(LanguageKeys.Commands.Tags.TagReset);
	}

	@requiresPermission(PermissionLevels.Moderator, async (message: GuildMessage) => {
		throw message.fetchLocale(LanguageKeys.Commands.Tags.TagPermissionlevel);
	})
	public async edit(message: GuildMessage, [id, content]: [string, string]) {
		const language = await message.fetchLanguage();

		if (!content) throw language.get(LanguageKeys.Commands.Tags.TagContentRequired);

		await message.guild.writeSettings((settings) => {
			const tagIndex = settings[GuildSettings.CustomCommands].findIndex((command) => command.id === id);
			if (tagIndex === -1) throw language.get(LanguageKeys.Commands.Tags.TagNotexists, { tag: id });

			settings[GuildSettings.CustomCommands].splice(tagIndex, 1, this.createTag(message, id, content));
		});

		return message.sendLocale(LanguageKeys.Commands.Tags.TagEdited, [{ name: id, content: cutText(content, 1000) }]);
	}

	@requiredPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	public async list(message: GuildMessage) {
		// Get tags, prefix, and language
		const [[tags, prefix], language] = await Promise.all([
			message.guild.readSettings([GuildSettings.CustomCommands, GuildSettings.Prefix]),
			message.fetchLanguage()
		]);
		if (!tags.length) throw language.get(LanguageKeys.Commands.Tags.TagListEmpty);

		const response = await message.send(
			new MessageEmbed().setColor(BrandingColors.Secondary).setDescription(pickRandom(language.get(LanguageKeys.System.Loading)))
		);

		// Get prefix and display all tags
		const display = new UserRichDisplay(new MessageEmbed().setColor(await DbSet.fetchColor(message)));

		// Add all pages, containing 30 tags each
		for (const page of chunk(tags, 30)) {
			const description = `\`${page.map((command) => `${prefix}${command.id}`).join('`, `')}\``;
			display.addPage((embed: MessageEmbed) => embed.setDescription(description));
		}

		// Run the display
		await display.start(response, message.author.id);
		return response;
	}

	@requiredPermissions(['EMBED_LINKS'])
	public async show(message: GuildMessage, [tagName]: [string]) {
		const tags = await message.guild.readSettings(GuildSettings.CustomCommands);
		const tag = tags.find((command) => command.id === tagName);
		return tag
			? tag.embed
				? message.sendEmbed(new MessageEmbed().setDescription(tag.content).setColor(tag.color))
				: message.sendMessage(tag.content)
			: null;
	}

	public async source(message: GuildMessage, [tagName]: [string]) {
		const tags = await message.guild.readSettings(GuildSettings.CustomCommands);
		const tag = tags.find((command) => command.id === tagName);
		return tag ? message.sendMessage(codeBlock('md', tag.content)) : null;
	}

	private createTag(message: GuildMessage, id: string, content: string): CustomCommand {
		return {
			id,
			content,
			embed: Reflect.has(message.flagArgs, 'embed'),
			color: Reflect.has(message.flagArgs, 'embed') ? this.parseColour(message) : 0,
			args: []
		};
	}

	private parseColour(message: GuildMessage) {
		let colour = message.flagArgs.color ?? message.flagArgs.colour;

		if (typeof colour === 'undefined') return 0;
		if (Number(colour)) return Math.floor(Number(colour));
		if (typeof colour === 'string' && this.#kHexlessRegex.test(colour)) colour = `#${colour}`;

		try {
			return parseColour(colour).b10.value;
		} catch (err) {
			return 0;
		}
	}
}
