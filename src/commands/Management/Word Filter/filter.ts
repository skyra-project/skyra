const { Command } = require('../../../index');

module.exports = class extends Command {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 5,
			description: (language) => language.get('COMMAND_FILTER_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_FILTER_EXTENDED'),
			permissionLevel: 5,
			runIn: ['text'],
			subcommands: true,
			usage: '<add|remove|reset|show> [word:string]',
			usageDelim: ' '
		});
	}

	public async add(msg, [word]) {
		if (!word) throw msg.language.get('COMMAND_FILTER_UNDEFINED_WORD');
		word = word.toLowerCase();
		if (msg.guild.settings.filter.raw.includes(word)) throw msg.language.get('COMMAND_FILTER_FILTERED', true);
		await msg.guild.settings.update('filter.raw', word, { action: 'add' });
		msg.guild.settings.updateFilter();
		return msg.sendLocale('COMMAND_FILTER_ADDED', [word]);
	}

	public async remove(msg, [word]) {
		if (!word) throw msg.language.get('COMMAND_FILTER_UNDEFINED_WORD');
		word = word.toLowerCase();
		if (!msg.guild.settings.filter.raw.includes(word)) throw msg.language.get('COMMAND_FILTER_FILTERED', false);
		if (msg.guild.settings.filter.raw.length === 1) return this.reset(msg);
		await msg.guild.settings.update('filter.raw', word, { action: 'remove' });
		msg.guild.settings.updateFilter();
		return msg.sendLocale('COMMAND_FILTER_REMOVED', [word]);
	}

	public async reset(msg) {
		await msg.guild.settings.reset('filter.raw');
		msg.guild.settings.filter.regexp = null;
		return msg.sendLocale('COMMAND_FILTER_RESET');
	}

	public show(msg) {
		const { raw } = msg.guild.settings.filter;
		return msg.sendMessage(!raw.length
			? msg.language.get('COMMAND_FILTER_SHOW_EMPTY')
			: msg.language.get('COMMAND_FILTER_SHOW', `\`${raw.join('`, `')}\``));
	}

};
