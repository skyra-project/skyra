const { Command } = require('../../index');

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

    async run(msg, [action, ...input], settings) {
        const word = input.length ? input.join(' ') : null;
        return this[action](msg, word, settings);
    }

    async add(msg, word, settings) {
        if (word === null) throw msg.language.get('COMMAND_FILTER_UNDEFINED_WORD');
        if (settings.filter.raw.includes(word)) throw msg.language.get('COMMAND_FILTER_FILTERED', true);
        settings.filter.raw = settings.filter.raw.push(word);
        settings.updateFilter();
        await settings.update({ filter: { raw: settings.filter.raw } });
        return msg.send(msg.language.get('COMMAND_FILTER_ADDED', word));
    }

    async remove(msg, word, settings) {
        if (word === null) throw msg.language.get('COMMAND_FILTER_UNDEFINED_WORD');
        if (!settings.filter.raw.includes(word)) throw msg.language.get('COMMAND_FILTER_FILTERED', false);
        settings.filter.raw = settings.filter.raw.filter(wd => wd !== word);
        settings.updateFilter();
        await settings.update({ filter: { raw: settings.filter.raw } });
        return msg.send(msg.language.get('COMMAND_FILTER_REMOVED', word));
    }

    async reset(msg, word, settings) {
        settings.filter.raw = [];
        settings.filter.regexp = null;
        await settings.update({ filter: { raw: [] } });
        return msg.send(msg.language.get('COMMAND_FILTER_RESET'));
    }

};
