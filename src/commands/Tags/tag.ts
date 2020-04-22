// Copyright (c) 2018 BDISTIN. All rights reserved. MIT license.
// Source: https://github.com/KlasaCommunityPlugins/tags

import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
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
	requiredPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
	usage: '<add|remove|edit|source|list|show:default> (tag:tagname) [content:...string]',
	usageDelim: ' '
})
export default class extends SkyraCommand {

	@requiresPermission(PermissionLevels.Moderator, (message: KlasaMessage) => { throw message.language.tget('COMMAND_TAG_PERMISSIONLEVEL'); })
	public async add(message: KlasaMessage, [tagName, content]: [string, string]) {
		// Check for permissions and content length
		if (!content) throw message.language.tget('COMMAND_TAG_CONTENT_REQUIRED');

		// Get tags, and if it does not exist, throw
		const tags = message.guild!.settings.get(GuildSettings.Tags);
		if (tags.some(([name]) => name === tagName)) throw message.language.tget('COMMAND_TAG_EXISTS', tagName);
		await message.guild!.settings.update(GuildSettings.Tags, [...tags, [tagName, content]], {
			arrayAction: 'overwrite',
			extraContext: { author: message.author.id }
		});

		return message.sendLocale('COMMAND_TAG_ADDED', [tagName, cutText(content, 1850)]);
	}

	@requiresPermission(PermissionLevels.Moderator, (message: KlasaMessage) => { throw message.language.tget('COMMAND_TAG_PERMISSIONLEVEL'); })
	public async remove(message: KlasaMessage, [tagName]: [string]) {
		// Get tags, and if it does not exist, throw
		const tags = message.guild!.settings.get(GuildSettings.Tags);

		const tag = tags.find(([name]) => name === tagName);
		if (!tag) throw message.language.tget('COMMAND_TAG_NOTEXISTS', tagName);
		await message.guild!.settings.update(GuildSettings.Tags, [tag], {
			arrayAction: 'remove',
			extraContext: { author: message.author.id }
		});

		return message.sendLocale('COMMAND_TAG_REMOVED', [tagName]);
	}

	@requiresPermission(PermissionLevels.Moderator, (message: KlasaMessage) => { throw message.language.tget('COMMAND_TAG_PERMISSIONLEVEL'); })
	public async edit(message: KlasaMessage, [tagName, content]: [string, string]) {
		if (!content) throw message.language.tget('COMMAND_TAG_CONTENT_REQUIRED');

		// Get tags, and if it does not exist, throw
		const tags = message.guild!.settings.get(GuildSettings.Tags);
		const index = tags.findIndex(([name]) => name === tagName);
		if (index === -1) throw message.language.tget('COMMAND_TAG_NOTEXISTS', tagName);
		await message.guild!.settings.update(GuildSettings.Tags, [[tagName, content]], {
			arrayIndex: index,
			extraContext: { author: message.author.id }
		});

		return message.sendLocale('COMMAND_TAG_EDITED', [tagName, cutText(content, 1000)]);
	}

	public async list(message: KlasaMessage) {
		const tags = message.guild!.settings.get(GuildSettings.Tags);
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
			const description = `\`${page.map(([name]) => `${prefix}${name}`).join('`, `')}\``;
			display.addPage((embed: MessageEmbed) => embed.setDescription(description));
		}

		// Run the display
		await display.start(response, message.author.id);
		return response;
	}

	public show(message: KlasaMessage, [tagName]: [string]) {
		const tags = message.guild!.settings.get(GuildSettings.Tags);
		const tag = tags.find(([name]) => name === tagName);
		return tag ? message.sendMessage(tag[1]) : null;
	}

	public source(message: KlasaMessage, [tagName]: [string]) {
		const tags = message.guild!.settings.get(GuildSettings.Tags);
		const tag = tags.find(([name]) => name === tagName);
		return tag ? message.sendCode('', tag[1]) : null;
	}

	public init() {
		this.createCustomResolver('tagname', (arg, possible, message, [action]) => {
			if (action === 'list') return undefined;
			if (!arg) throw message.language.tget('RESOLVER_INVALID_STRING', possible.name);
			if (arg.includes('`') || arg.includes('\u200B')) throw message.language.tget('COMMAND_TAG_NAME_NOTALLOWED');
			if (arg.length > 50) throw message.language.tget('COMMAND_TAG_NAME_TOOLONG');
			return arg.toLowerCase();
		});

		return Promise.resolve();
	}

}
