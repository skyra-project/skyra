const { Command } = require('../../index');

/* eslint-disable class-methods-use-this */
module.exports = class Help extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['commands'],
            mode: 2,

            usage: '[command:command]',
            description: 'Display help for all or a single command.'
        });
    }

    async run(msg, [cmd], settings) {
        const method = this.client.user.bot ? 'author' : 'channel';
        if (cmd) {
            const info = [
                `= ${cmd.name} = `,
                cmd.description,
                `usage :: ${cmd.usage.fullUsage(msg)}`,
                'Extended Help ::',
                cmd.extendedHelp
            ].join('\n');
            return msg.send(info, { code: 'asciidoc' });
        }
        const help = await this.buildHelp(msg, settings);
        const categories = Object.keys(help);
        const helpMessage = [];
        for (let cat = 0; cat < categories.length; cat++) {
            helpMessage.push(`**${categories[cat]} Commands**: \`\`\`asciidoc`);
            const subCategories = Object.keys(help[categories[cat]]);
            for (let subCat = 0; subCat < subCategories.length; subCat++) helpMessage.push(`= ${subCategories[subCat]} =`, `${help[categories[cat]][subCategories[subCat]].join('\n')}\n`);
            helpMessage.push('```\n\u200b');
        }

        return msg[method].send(helpMessage, { split: { char: '\u200b' } })
            .then(() => { if (msg.channel.type !== 'dm' && this.client.user.bot) msg.send(msg.language.get('COMMAND_HELP_DM')); })
            .catch(() => { if (msg.channel.type !== 'dm' && this.client.user.bot) msg.send(msg.language.get('COMMAND_HELP_NODM')); });
    }

    /* eslint-disable no-restricted-syntax, no-prototype-builtins */
    async buildHelp(msg, settings) {
        const help = {};

        const commandNames = Array.from(this.client.commands.keys());
        const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);

        await Promise.all(this.client.commands.map((command) =>
            this.client.inhibitors.run(msg, command, true, settings)
                .then(() => {
                    if (!help.hasOwnProperty(command.category)) help[command.category] = {};
                    if (!help[command.category].hasOwnProperty(command.subCategory)) help[command.category][command.subCategory] = [];
                    help[command.category][command.subCategory].push(`${settings.master.prefix}${command.name.padEnd(longest)} :: ${command.description}`);
                    return;
                })
                .catch(() => {
                    // noop
                })
        ));

        return help;
    }

};
