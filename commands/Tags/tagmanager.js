const { Command } = require('../../index');
const REGEXP_DOT = /\*/g, REGEXP_ESC = '\\*';

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: msg => msg.language.get('COMMAND_TAGMANAGER_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_TAGMANAGER_EXTENDED'),
			permLevel: 4,
			runIn: ['text'],
			subcommands: true,
			usage: '<add|edit|remove> <tag:string> [contents:string] [...]',
			usageDelim: ' '
		});
	}

	async add(msg, [tag, ...contents]) {
		tag = tag.toLowerCase();

		const currentTags = msg.guild.configs.tags;
		if (currentTags.has(tag)) throw msg.language.get('COMMAND_TAGS_ADD_EXISTS', tag);
		if (!contents.length) throw msg.language.get('COMMAND_TAGS_CONTENT_REQUIRED');

		contents = contents.join(' ');
		currentTags.set(tag, contents);
		await msg.guild.configs.update({ _tags: [...currentTags] });
		return msg.sendMessage(msg.language.get('COMMAND_TAGS_ADD_ADDED',
			tag.replace(REGEXP_DOT, REGEXP_ESC),
			contents.replace(REGEXP_DOT, REGEXP_ESC)));
	}

	async edit(msg, [tag, ...contents]) {
		tag = tag.toLowerCase();

		const currentTags = msg.guild.configs.tags;
		const oldTag = currentTags.get(tag);
		if (!oldTag) throw msg.language.get('COMMAND_TAGS_REMOVE_NOT_EXISTS', tag);
		if (!contents.length) throw msg.language.get('COMMAND_TAGS_CONTENT_REQUIRED');

		contents = contents.join(' ');
		currentTags.set(tag, contents);
		await msg.guild.configs.update({ _tags: [...currentTags] });
		return msg.sendMessage(msg.language.get('COMMAND_TAGS_EDITED',
			tag.replace(REGEXP_DOT, REGEXP_ESC),
			contents.replace(REGEXP_DOT, REGEXP_ESC),
			oldTag.replace(REGEXP_DOT, REGEXP_ESC)));
	}

	async remove(msg, [tag]) {
		tag = tag.toLowerCase();

		const currentTags = msg.guild.configs.tags;
		if (!currentTags.has(tag)) throw msg.language.get('COMMAND_TAGS_REMOVE_NOT_EXISTS', tag.replace(REGEXP_DOT, REGEXP_ESC));
		currentTags.delete(tag);
		await msg.guild.configs.update({ _tags: [...currentTags] });
		return msg.sendMessage(msg.language.get('COMMAND_TAGS_REMOVE_REMOVED',
			tag.replace(REGEXP_DOT, REGEXP_ESC)));
	}

};
