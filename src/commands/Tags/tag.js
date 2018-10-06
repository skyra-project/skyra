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
const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_TAG_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_TAG_EXTENDED'),
			runIn: ['text'],
			subcommands: true,
			usage: '<add|remove|edit|source|list|show:default> (tag:string) [content:...string]',
			usageDelim: ' '
		});

		this.createCustomResolver('string', (arg, possible, message, [action]) => {
			if (action === 'list') return undefined;
			if (!arg) throw message.language.get('RESOLVER_INVALID_STRING', possible.name);
			if (arg.includes('`') || arg.includes('\u200B')) throw message.language.get('COMMAND_TAG_NAME_NOTALLOWED');
			if (arg.length > 50) throw message.language.get('COMMAND_TAG_NAME_TOOLONG');
			return arg.toLowerCase();
		});
	}

	async add(message, [tagName, content]) {
		if (!await message.hasAtLeastPermissionLevel(4)) throw message.language.get('COMMAND_TAG_PERMISSIONLEVEL');
		if (message.guild.settings.tags.some(([name]) => name === tagName)) throw message.language.get('COMMAND_TAG_EXISTS', tagName);
		if (!content.length) throw message.language.get('COMMAND_TAG_CONTENT_REQUIRED');
		await message.guild.settings.update('tags', [...message.guild.settings.tags, [tagName, content]], { action: 'overwrite' });
		return message.sendLocale('COMMAND_TAG_ADDED', [tagName, content]);
	}

	async remove(message, [tagName]) {
		if (!await message.hasAtLeastPermissionLevel(4)) throw message.language.get('COMMAND_TAG_PERMISSIONLEVEL');
		const tag = message.guild.settings.tags.find(([name]) => name === tagName);
		if (!tag) throw message.language.get('COMMAND_TAG_NOTEXISTS', tagName);
		await message.guild.settings.update('tags', tag, { action: 'remove' });
		return message.sendLocale('COMMAND_TAG_REMOVED', [tagName]);
	}

	async edit(message, [tagName, content]) {
		if (!await message.hasAtLeastPermissionLevel(4)) throw message.language.get('COMMAND_TAG_PERMISSIONLEVEL');
		if (!content.length) throw message.language.get('COMMAND_TAG_CONTENT_REQUIRED');
		const index = message.guild.settings.tags.findIndex(([name]) => name === tagName);
		if (index === -1) throw message.language.get('COMMAND_TAG_NOTEXISTS', tagName);
		await message.guild.settings.update('tags', [tagName, content], { arrayPosition: index });
		return message.sendLocale('COMMAND_TAG_EDITED', [tagName, content]);
	}

	async list(message) {
		if (!message.guild.settings.tags.length) throw message.language.get('COMMAND_TAG_LIST_EMPTY');
		const { prefix } = message.guild.settings;
		return message.sendLocale('COMMAND_TAG_LIST', [message.guild.settings.tags.map(v => `\`${prefix}${v[0]}\``)]);
	}

	show(message, [tagName]) {
		const tag = message.guild.settings.tags.find(([name]) => name === tagName);
		return tag ? message.send(tag[1]) : null;
	}

	source(message, [tagName]) {
		const tag = message.guild.settings.tags.find(([name]) => name === tagName);
		return tag ? message.sendCode('', tag[1]) : null;
	}

};
