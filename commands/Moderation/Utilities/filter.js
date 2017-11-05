const { structures: { Command } } = require('../../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guildOnly: true,
			permLevel: 1,
			mode: 2,
			cooldown: 5,

			usage: '<add|remove|reset> [word:string] [...]',
			usageDelim: ' ',
			description: 'Modify the server\'s word blacklist.'
		});
	}

	async run(msg, [action, ...input], settings, i18n) {
		const word = input.length ? input.join(' ') : null;
		return this[action](msg, word, settings, i18n);
	}

	async add(msg, word, settings, i18n) {
		if (word === null) throw i18n.get('COMMAND_FILTER_UNDEFINED_WORD');
		if (settings.filter.raw.includes(word)) throw i18n.get('COMMAND_FILTER_FILTERED', true);
		settings.filter.raw.push(word);
		settings.updateFilter();
		await settings.update({ filter: { raw: settings.filter.raw } });
		return msg.send(i18n.get('COMMAND_FILTER_ADDED', word));
	}

	async remove(msg, word, settings, i18n) {
		if (word === null) throw i18n.get('COMMAND_FILTER_UNDEFINED_WORD');
		if (!settings.filter.raw.includes(word)) throw i18n.get('COMMAND_FILTER_FILTERED', false);
		settings.filter.raw = settings.filter.raw.filter(wd => wd !== word);
		settings.updateFilter();
		await settings.update({ filter: { raw: settings.filter.raw } });
		return msg.send(i18n.get('COMMAND_FILTER_REMOVED', word));
	}

	async reset(msg, word, settings, i18n) {
		settings.filter.raw = [];
		settings.filter.regexp = null;
		await settings.update({ filter: { raw: [] } });
		return msg.send(i18n.get('COMMAND_FILTER_RESET'));
	}

};
