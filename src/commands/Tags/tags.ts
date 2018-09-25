const { Command } = require('../../index');

export default class extends Command {

	public constructor(client: Skyra, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMANDS_TAGS_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMANDS_TAGS_EXTENDED'),
			cooldown: 5,
			runIn: ['text'],
			usage: '[list|tag:string]'
		});
	}

	public run(msg, [name = 'list']) {
		const { tags } = msg.guild.settings;
		return name === 'list' ? this.list(msg, tags) : this.get(msg, tags, name);
	}

	public get(msg, tags, name) {
		if (!tags.has(name)) return Promise.reject(msg.language.get('COMMAND_TAGS_REMOVE_NOT_EXISTS', name));
		return msg.sendMessage(tags.get(name));
	}

	public list(msg, tags) {
		if (tags.size === 0) return Promise.reject(msg.language.get('COMMAND_TAGS_LIST_EMPTY'));
		const { prefix } = msg.guild.settings;
		return msg.sendLocale('COMMAND_TAGS_LIST', [[...tags.keys()].map((tag) => `\`${prefix}${tag}\``)]);
	}

}
