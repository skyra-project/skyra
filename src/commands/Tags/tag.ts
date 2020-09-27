// Copyright (c) 2018 BDISTIN. All rights reserved. MIT license.
// Source: https://github.com/KlasaCommunityPlugins/tags

import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { PermissionLevels } from '@lib/types/Enums';
import { CustomCommand, GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { chunk, codeBlock, cutText } from '@sapphire/utilities';
import { ApplyOptions, requiredPermissions, requiresPermission } from '@skyra/decorators';
import { parse as parseColour } from '@utils/Color';
import { BrandingColors } from '@utils/constants';
import { pickRandom } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { CommandOptions, KlasaMessage } from 'klasa';

@ApplyOptions<CommandOptions>({
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
export default class extends SkyraCommand {
	// Based on HEX regex from @utils/Color
	private kHexlessRegex = /^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/i;

	public async init() {
		this.createCustomResolver('tagname', (arg, possible, message, [action]) => {
			if (action === 'list' || action === 'reset') return undefined;
			if (!arg) throw message.language.get(LanguageKeys.Resolvers.InvalidString, { name: possible.name });
			return arg.toLowerCase();
		});
	}

	@requiresPermission(PermissionLevels.Moderator, (message: KlasaMessage) => {
		throw message.language.get(LanguageKeys.Commands.Tags.TagPermissionlevel);
	})
	public async add(message: KlasaMessage, [id, content]: [string, string]) {
		// Check for permissions and content length
		if (!content) throw message.language.get(LanguageKeys.Commands.Tags.TagContentRequired);

		// Get tags, and if it does not exist, throw
		const tags = message.guild!.settings.get(GuildSettings.CustomCommands);
		if (tags.some((command) => command.id === id)) throw message.language.get(LanguageKeys.Commands.Tags.TagExists, { tag: id });
		await message.guild!.settings.update(GuildSettings.CustomCommands, this.createTag(message, id, content), {
			arrayAction: 'add',
			extraContext: { author: message.author.id }
		});

		return message.sendLocale(LanguageKeys.Commands.Tags.TagAdded, [{ name: id, content: cutText(content, 1850) }]);
	}

	@requiresPermission(PermissionLevels.Moderator, (message: KlasaMessage) => {
		throw message.language.get(LanguageKeys.Commands.Tags.TagPermissionlevel);
	})
	public async remove(message: KlasaMessage, [id]: [string]) {
		// Get tags, and if it does not exist, throw
		const tags = message.guild!.settings.get(GuildSettings.CustomCommands);

		const tag = tags.find((command) => command.id === id);
		if (!tag) throw message.language.get(LanguageKeys.Commands.Tags.TagNotexists, { tag: id });
		await message.guild!.settings.update(GuildSettings.CustomCommands, tag, {
			arrayAction: 'remove',
			extraContext: { author: message.author.id }
		});

		return message.sendLocale(LanguageKeys.Commands.Tags.TagRemoved, [{ name: id }]);
	}

	@requiresPermission(PermissionLevels.Moderator, (message: KlasaMessage) => {
		throw message.language.get(LanguageKeys.Commands.Tags.TagPermissionlevel);
	})
	public async reset(message: KlasaMessage) {
		await message.guild!.settings.reset(GuildSettings.CustomCommands);
		return message.sendLocale(LanguageKeys.Commands.Tags.TagReset);
	}

	@requiresPermission(PermissionLevels.Moderator, (message: KlasaMessage) => {
		throw message.language.get(LanguageKeys.Commands.Tags.TagPermissionlevel);
	})
	public async edit(message: KlasaMessage, [id, content]: [string, string]) {
		if (!content) throw message.language.get(LanguageKeys.Commands.Tags.TagContentRequired);

		// Get tags, and if it does not exist, throw
		const tags = message.guild!.settings.get(GuildSettings.CustomCommands);
		const index = tags.findIndex((command) => command.id === id);
		if (index === -1) throw message.language.get(LanguageKeys.Commands.Tags.TagNotexists, { tag: id });
		await message.guild!.settings.update(GuildSettings.CustomCommands, this.createTag(message, id, content), {
			arrayIndex: index,
			extraContext: { author: message.author.id }
		});

		return message.sendLocale(LanguageKeys.Commands.Tags.TagEdited, [{ name: id, content: cutText(content, 1000) }]);
	}

	@requiredPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	public async list(message: KlasaMessage) {
		const tags = message.guild!.settings.get(GuildSettings.CustomCommands);
		if (!tags.length) throw message.language.get(LanguageKeys.Commands.Tags.TagListEmpty);

		const response = await message.send(
			new MessageEmbed().setColor(BrandingColors.Secondary).setDescription(pickRandom(message.language.get(LanguageKeys.System.Loading)))
		);

		// Get prefix and display all tags
		const prefix = message.guild!.settings.get(GuildSettings.Prefix);
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
	public show(message: KlasaMessage, [tagName]: [string]) {
		const tags = message.guild!.settings.get(GuildSettings.CustomCommands);
		const tag = tags.find((command) => command.id === tagName);
		return tag
			? tag.embed
				? message.sendEmbed(new MessageEmbed().setDescription(tag.content).setColor(tag.color))
				: message.sendMessage(tag.content)
			: null;
	}

	public source(message: KlasaMessage, [tagName]: [string]) {
		const tags = message.guild!.settings.get(GuildSettings.CustomCommands);
		const tag = tags.find((command) => command.id === tagName);
		return tag ? message.sendMessage(codeBlock('md', tag.content)) : null;
	}

	private createTag(message: KlasaMessage, id: string, content: string): CustomCommand {
		return {
			id,
			content,
			embed: Reflect.has(message.flagArgs, 'embed'),
			color: Reflect.has(message.flagArgs, 'embed') ? this.parseColour(message) : 0,
			args: []
		};
	}

	private parseColour(message: KlasaMessage) {
		let colour = message.flagArgs.color ?? message.flagArgs.colour;

		if (typeof colour === 'undefined') return 0;
		if (Number(colour)) return Math.floor(Number(colour));
		if (typeof colour === 'string' && this.kHexlessRegex.test(colour)) colour = `#${colour}`;

		try {
			return parseColour(colour).b10.value;
		} catch (err) {
			return 0;
		}
	}
}
