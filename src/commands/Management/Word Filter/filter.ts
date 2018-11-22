import { Command } from '../../../index';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 5,
			description: (language) => language.get('COMMAND_FILTER_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_FILTER_EXTENDED'),
			permissionLevel: 5,
			runIn: ['text'],
			subcommands: true,
			usage: '<add|remove|reset|show:default> (word:word)',
			usageDelim: ' '
		});

		this.createCustomResolver('word', (arg, possible, msg, [type]) => {
			if (type === 'reset' || type === 'show') return undefined;
			if (arg) return arg.toLowerCase();
			throw msg.language.get('COMMAND_FILTER_UNDEFINED_WORD');
		});
	}

	public async add(msg, [word]) {
		// Check if the word is not filtered
		const { raw, regexp } = msg.guild.settings.filter;
		if (raw.includes(word) || (regexp && regexp.test(word))) throw msg.language.get('COMMAND_FILTER_FILTERED', true);

		// Perform update
		await msg.guild.settings.update('filter.raw', word, { action: 'add' });
		msg.guild.settings.updateFilter();
		return msg.sendLocale('COMMAND_FILTER_ADDED', [word]);
	}

	public async remove(msg, [word]) {
		// Check if the word is already filtered
		const { raw } = msg.guild.settings.filter;
		if (!raw.includes(word)) throw msg.language.get('COMMAND_FILTER_FILTERED', false);

		// Perform update
		if (raw.length === 1) return this.reset(msg);
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

}
