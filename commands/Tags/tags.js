const { Command, PromptList } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: msg => msg.language.get('COMMAND_TAGS_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_TAGS_EXTENDED'),
			cooldown: 5,
			runIn: ['text'],
			usage: '[list|tag:string]'
		});
	}

	async run(msg, [name = 'list']) {
		const { tags } = msg.guild.configs;
		if (name === 'list') return this.list(msg, tags);
		return this.get(msg, tags, name);
	}

	get(msg, tags, name) {
		if (!tags.has(name)) return Promise.reject(msg.language.get('COMMAND_TAGS_REMOVE_NOT_EXISTS', name));
		return msg.send(tags.get(name));
	}

	async list(msg, tags) {
		if (tags.size === 0) return Promise.reject(msg.language.get('COMMAND_TAGS_LIST_EMPTY'));
		await new PromptList(tags.map((tag, name) => [
			name,
			tag.length > 40 ? `${tag.slice(0, 40)}...` : tag
		])).run(msg).catch(() => null);
		return msg;
	}

};
