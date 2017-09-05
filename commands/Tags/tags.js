const { Command } = require('../../index');
const provider = require('../../providers/rethink');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permLevel: 10,
            mode: 2,

            usage: '<add|remove|edit|get|list> [tag:string] [contents:string] [...]',
            usageDelim: ' ',
            description: 'Manage tags.'
        });
    }

    async run(msg, [action, tag = null, ...contents], settings, i18n) {
        contents = contents.length > 0 ? contents.join(' ') : null;

        return this[action](msg, tag, contents, settings, i18n);
    }

    async add(msg, tag, contents, settings, i18n) {
        if (settings.tags.has(tag)) throw i18n.get('COMMAND_TAGS_ADD_EXISTS', tag);
        const tags = settings.tags.set(tag, contents);
        await provider.update('guilds', msg.guild.id, { tags });
    }

};
