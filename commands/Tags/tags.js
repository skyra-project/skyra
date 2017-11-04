const { Command } = require('../../index');
const listify = require('../../functions/listify');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['tag'],
			mode: 2,

			usage: '[list|tag:string] [index:integer]',
			usageDelim: ' ',
			description: 'List or get a tag.',
			extend: {
				EXPLANATION: [
					'What are tags? Tags are chunk of texts stored under a name, which allows you, for example,',
					'you can do `s!tag rule1` and get a response with what the rule number one of your server is.',
					'Besides that, tags are also used for memes, who doesn\'t like memes?'
				].join(' '),
				ARGUMENTS: '<list|tag>',
				EXP_USAGE: [
					['list', 'Show a list of all tags for this server.'],
					['tag', 'Show the content of the selected tag.']
				]
			}
		});
	}

	async run(msg, [tag = 'list', index = 1], settings, i18n) {
		const tags = settings.tags;
		if (tag === 'list') return this.list(msg, index, tags, i18n);
		return this.get(msg, tag, tags, i18n);
	}

	get(msg, tag, tags, i18n) {
		if (tag === null) return Promise.reject(i18n.get('COMMAND_TAGS_NAME_REQUIRED'));
		if (tags.has(tag) === false) return Promise.reject(i18n.get('COMMAND_TAGS_REMOVE_NOT_EXISTS', tag));
		return msg.send(tags.get(tag));
	}

	list(msg, index, tags, i18n) {
		if (tags.size === 0) return Promise.reject(i18n.get('COMMAND_TAGS_LIST_EMPTY'));
		return msg.send(listify(tags, { index, length: 15 }), { code: 'asciidoc' });
	}

};
