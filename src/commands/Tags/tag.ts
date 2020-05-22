// Copyright (c) 2018 BDISTIN. All rights reserved. MIT license.
// Source: https://github.com/KlasaCommunityPlugins/tags

import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { GuildSettings, CustomCommand } from '@lib/types/settings/GuildSettings';
import { cutText, getColor } from '@utils/util';
import { KlasaMessage, CommandOptions } from 'klasa';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { chunk } from '@klasa/utils';
import { BrandingColors } from '@utils/constants';
import { MessageEmbed } from 'discord.js';
import { ApplyOptions, requiresPermission } from '@skyra/decorators';
import { PermissionLevels } from '@lib/types/Enums';

@ApplyOptions<CommandOptions>({
	aliases: ['tags'],
	description: language => language.tget('COMMAND_TAG_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_TAG_EXTENDED'),
	runIn: ['text'],
	subcommands: true,
	flagSupport: true,
	requiredPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
	usage: '<add|remove|edit|source|list|show:default> (tag:tagname) [content:...string]',
	usageDelim: ' '
})
export default class extends SkyraCommand {

	@requiresPermission(PermissionLevels.Moderator, (message: KlasaMessage) => { throw message.language.tget('COMMAND_TAG_PERMISSIONLEVEL'); })
	public async add(message: KlasaMessage, [id, content]: [string, string]) {
		// Check for permissions and content length
		if (!content) throw message.language.tget('COMMAND_TAG_CONTENT_REQUIRED');

		// Get tags, and if it does not exist, throw
		const tags = message.guild!.settings.get(GuildSettings.CustomCommands);
		if (tags.some(command => command.id === id)) throw message.language.tget('COMMAND_TAG_EXISTS', id);
		await message.guild!.settings.update(GuildSettings.CustomCommands, this.createTag(message, id, content), {
			arrayAction: 'add',
			extraContext: { author: message.author.id }
		});

		return message.sendLocale('COMMAND_TAG_ADDED', [id, cutText(content, 1850)]);
	}

	@requiresPermission(PermissionLevels.Moderator, (message: KlasaMessage) => { throw message.language.tget('COMMAND_TAG_PERMISSIONLEVEL'); })
	public async remove(message: KlasaMessage, [id]: [string]) {
		// Get tags, and if it does not exist, throw
		const tags = message.guild!.settings.get(GuildSettings.CustomCommands);

		const tag = tags.find(command => command.id === id);
		if (!tag) throw message.language.tget('COMMAND_TAG_NOTEXISTS', id);
		await message.guild!.settings.update(GuildSettings.CustomCommands, tag, {
			arrayAction: 'remove',
			extraContext: { author: message.author.id }
		});

		return message.sendLocale('COMMAND_TAG_REMOVED', [id]);
	}

	@requiresPermission(PermissionLevels.Moderator, (message: KlasaMessage) => { throw message.language.tget('COMMAND_TAG_PERMISSIONLEVEL'); })
	public async edit(message: KlasaMessage, [id, content]: [string, string]) {
		if (!content) throw message.language.tget('COMMAND_TAG_CONTENT_REQUIRED');

		// Get tags, and if it does not exist, throw
		const tags = message.guild!.settings.get(GuildSettings.CustomCommands);
		const index = tags.findIndex(command => command.id === id);
		if (index === -1) throw message.language.tget('COMMAND_TAG_NOTEXISTS', id);
		await message.guild!.settings.update(GuildSettings.CustomCommands, this.createTag(message, id, content), {
			arrayIndex: index,
			extraContext: { author: message.author.id }
		});

		return message.sendLocale('COMMAND_TAG_EDITED', [id, cutText(content, 1000)]);
	}

	public async list(message: KlasaMessage) {
		const tags = message.guild!.settings.get(GuildSettings.CustomCommands);
		if (!tags.length) throw message.language.tget('COMMAND_TAG_LIST_EMPTY');

		const response = await message.send(new MessageEmbed()
			.setColor(BrandingColors.Secondary)
			.setDescription(message.language.tget('SYSTEM_LOADING')));

		// Get prefix and display all tags
		const prefix = message.guild!.settings.get(GuildSettings.Prefix);
		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message)));

		// Add all pages, containing 30 tags each
		for (const page of chunk(tags, 30)) {
			const description = `\`${page.map(command => `${prefix}${command.id}`).join('`, `')}\``;
			display.addPage((embed: MessageEmbed) => embed.setDescription(description));
		}

		// Run the display
		await display.start(response, message.author.id);
		return response;
	}

	public show(message: KlasaMessage, [tagName]: [string]) {
		const tags = message.guild!.settings.get(GuildSettings.CustomCommands);
		const tag = tags.find(command => command.id === tagName);
		return tag
			? tag.embed
				? message.sendEmbed(new MessageEmbed()
					.setDescription(tag.content)
					.setColor(tag.color))
				: message.sendMessage(tag.content)
			: null;
	}

	public source(message: KlasaMessage, [tagName]: [string]) {
		const tags = message.guild!.settings.get(GuildSettings.CustomCommands);
		const tag = tags.find(command => command.id === tagName);
		return tag ? message.sendCode('md', tag.content) : null;
	}

	public init() {
		this.createCustomResolver('tagname', (arg, possible, message, [action]) => {
			if (action === 'list') return undefined;
			if (!arg) throw message.language.tget('RESOLVER_INVALID_STRING', possible.name);
			return arg.toLowerCase();
		});

		return Promise.resolve();
	}

	private createTag(message: KlasaMessage, id: string, content: string): CustomCommand {
		return {
			id,
			content,
			embed: Reflect.has(message.flagArgs, 'embed'),
			color: Math.floor(Number(message.flagArgs) || 0),
			args: []
		};
	}

}
