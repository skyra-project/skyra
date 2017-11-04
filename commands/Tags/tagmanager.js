const { Command } = require('../../index');
const provider = require('../../providers/rethink');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permLevel: 2,
			mode: 2,

			usage: '<add|remove|edit> <tag:string> [contents:string] [...]',
			usageDelim: ' ',
			description: 'Manage tags.',
			extend: {
				EXPLANATION: [
					'This command gives you tag management (you can use it to add, remove or edit them).',
					'What are tags? Tags are chunk of texts stored under a name, which allows you, for example,',
					'you can do `s!tag rule1` and get a response with what the rule number one of your server is.',
					'Besides that, tags are also used for memes, who doesn\'t like memes?'
				].join(' '),
				ARGUMENTS: '<action> <tag> [contents]',
				EXP_USAGE: [
					['action', 'The action to perform: **add** to add new tags, **remove** to delete them, and **edit** to edit them.'],
					['tag', 'The tag\'s name.'],
					['contents', 'Required for the actions **add** and **edit**, specifies the content for the tag.']
				],
				EXAMPLES: [
					'add rule1 Respect other users. Harassment, hatespeech, etc... will not be tolerated.',
					'edit rule1 Just be respectful with the others.',
					'remove rule1'
				]
			}
		});
	}

	async run(msg, [action, tag, ...contents], settings, i18n) {
		contents = contents.length > 0 ? contents.join(' ') : null;
		const tags = settings.tags;

		return this[action](msg, tag, contents, tags, i18n);
	}

	async add(msg, tag, contents, tags, i18n) {
		if (tag === null) throw i18n.get('COMMAND_TAGS_NAME_REQUIRED');
		if (tags.has(tag)) throw i18n.get('COMMAND_TAGS_ADD_EXISTS', tag);
		if (contents === null) throw i18n.get('COMMAND_TAGS_CONTENT_REQUIRED');
		tags.set(tag, contents);
		await provider.update('guilds', msg.guild.id, { tags: Array.from(tags) });
		return msg.send(i18n.get('COMMAND_TAGS_ADD_ADDED', tag.replace(/\*/g, '\\*'), contents.replace(/\*/g, '\\*')));
	}

	async remove(msg, tag, contents, tags, i18n) {
		if (tags.has(tag) === false) throw i18n.get('COMMAND_TAGS_REMOVE_NOT_EXISTS', tag);
		tags.delete(tag);
		await provider.update('guilds', msg.guild.id, { tags: Array.from(tags) });
		return msg.send(i18n.get('COMMAND_TAGS_REMOVE_REMOVED', tag.replace(/\*/g, '\\*')));
	}

	async edit(msg, tag, contents, tags, i18n) {
		if (tag === null) throw i18n.get('COMMAND_TAGS_NAME_REQUIRED');
		const oldTag = tags.get(tag);
		if (!oldTag) throw i18n.get('COMMAND_TAGS_REMOVE_NOT_EXISTS', tag);
		if (contents === null) throw i18n.get('COMMAND_TAGS_CONTENT_REQUIRED');
		tags.set(tag, contents);
		await provider.update('guilds', msg.guild.id, { tags: Array.from(tags) });
		return msg.send(i18n.get('COMMAND_TAGS_EDITED', tag.replace(/\*/g, '\\*'), contents.replace(/\*/g, '\\*'), oldTag.replace(/\*/g, '\\*')));
	}

};
