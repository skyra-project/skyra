/**
 * @link https://github.com/bdistin/klasa-tags/
 * @copyright BDISTIN
 * @license MIT
 * MIT License
 *
 * Copyright (c) 2018 BDISTIN
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_TAG_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_TAG_EXTENDED'),
			runIn: ['text'],
			subcommands: true,
			usage: '<add|remove|edit|source|list|show:default> (tag:string) [content:...string]',
			usageDelim: ' '
		});

		this.createCustomResolver('string', (arg, possible, message, [action]) => {
			if (action === 'list') return undefined;
			if (!arg) throw message.language.tget('RESOLVER_INVALID_STRING', possible.name);
			if (arg.includes('`') || arg.includes('\u200B')) throw message.language.tget('COMMAND_TAG_NAME_NOTALLOWED');
			if (arg.length > 50) throw message.language.tget('COMMAND_TAG_NAME_TOOLONG');
			return arg.toLowerCase();
		});
	}

	public async add(message: KlasaMessage, [tagName, content]: [string, string]) {
		// Check for permissions and content length
		if (!await message.hasAtLeastPermissionLevel(4)) throw message.language.tget('COMMAND_TAG_PERMISSIONLEVEL');
		if (!content) throw message.language.tget('COMMAND_TAG_CONTENT_REQUIRED');

		// Get tags, and if it does not exist, throw
		const tags = message.guild!.settings.get(GuildSettings.Tags);
		if (tags.some(([name]) => name === tagName)) throw message.language.tget('COMMAND_TAG_EXISTS', tagName);
		await message.guild!.settings.update(GuildSettings.Tags, [...tags, [tagName, content]], { arrayAction: 'overwrite' });

		return message.sendLocale('COMMAND_TAG_ADDED', [tagName, content]);
	}

	public async remove(message: KlasaMessage, [tagName]: [string]) {
		if (!await message.hasAtLeastPermissionLevel(4)) throw message.language.tget('COMMAND_TAG_PERMISSIONLEVEL');
		// Get tags, and if it does not exist, throw
		const tags = message.guild!.settings.get(GuildSettings.Tags);

		const tag = tags.find(([name]) => name === tagName);
		if (!tag) throw message.language.tget('COMMAND_TAG_NOTEXISTS', tagName);
		await message.guild!.settings.update(GuildSettings.Tags, [tag], { arrayAction: 'remove' });

		return message.sendLocale('COMMAND_TAG_REMOVED', [tagName]);
	}

	public async edit(message: KlasaMessage, [tagName, content]: [string, string]) {
		if (!await message.hasAtLeastPermissionLevel(4)) throw message.language.tget('COMMAND_TAG_PERMISSIONLEVEL');
		if (!content) throw message.language.tget('COMMAND_TAG_CONTENT_REQUIRED');

		// Get tags, and if it does not exist, throw
		const tags = message.guild!.settings.get(GuildSettings.Tags);
		const index = tags.findIndex(([name]) => name === tagName);
		if (index === -1) throw message.language.tget('COMMAND_TAG_NOTEXISTS', tagName);
		await message.guild!.settings.update(GuildSettings.Tags, [[tagName, content]], { arrayIndex: index });

		return message.sendLocale('COMMAND_TAG_EDITED', [tagName, content]);
	}

	public async list(message: KlasaMessage) {
		const tags = message.guild!.settings.get(GuildSettings.Tags);
		if (!tags.length) throw message.language.tget('COMMAND_TAG_LIST_EMPTY');

		// Get prefix and display all tags
		const prefix = message.guild!.settings.get(GuildSettings.Prefix);
		return message.sendLocale('COMMAND_TAG_LIST', [tags.map(v => `\`${prefix}${v[0]}\``)]);
	}

	public show(message: KlasaMessage, [tagName]: [string]) {
		const tags = message.guild!.settings.get(GuildSettings.Tags);
		const tag = tags.find(([name]) => name === tagName);
		return tag ? message.send(tag[1]) : null;
	}

	public source(message: KlasaMessage, [tagName]: [string]) {
		const tags = message.guild!.settings.get(GuildSettings.Tags);
		const tag = tags.find(([name]) => name === tagName);
		return tag ? message.sendCode('', tag[1]) : null;
	}

}
