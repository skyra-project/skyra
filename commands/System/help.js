const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['commands'],
            mode: 2,
            cooldown: 15,

            usage: '[command:string]',
            description: 'Display help for all or a single command.'
        });
    }

    async run(msg, [cmd = null], settings, i18n) {
        if (cmd) {
            cmd = this.client.commands.get(cmd);
            if (!cmd) throw i18n.get('RESOLVER_INVALID_PIECE', 'command', 'command');
            const hasPermission = await msg.hasLevel(cmd.permLevel);
            if (hasPermission === false) throw i18n.get('INHIBITOR_PERMISSIONS');
            const info = [
                `📃 | ***Help Message*** | __**${cmd.name}**__\n${cmd.description}\n`,
                `📝 | ***Command Usage***\n\`${cmd.usage.fullUsage(msg)}\`\n`,
                `🔍 | ***Extended Help***\n${cmd.extendedHelp}`
            ].join('\n');
            return msg.send(info);
        }
        const help = await this.buildHelp(msg, settings);
        const categories = Object.keys(help);
        const helpMessage = ['📃 | *Help Message*\n'];
        for (let cat = 0; cat < categories.length; cat++) {
            helpMessage.push(`**${categories[cat]} Commands**\n`);
            const subCategories = Object.keys(help[categories[cat]]);
            for (let subCat = 0; subCat < subCategories.length; subCat++) {
                if (subCategories[subCat] !== 'General') helpMessage.push(`__**${subCategories[subCat]}**__\n`);
                helpMessage.push(`${help[categories[cat]][subCategories[subCat]].join('\n')}\n`);
            }
        }

        return msg.author.send(helpMessage, { split: { char: '\n' } })
            .then(() => { if (msg.channel.type !== 'dm') msg.send(i18n.get('COMMAND_HELP_DM')); })
            .catch(() => { if (msg.channel.type !== 'dm') msg.send(i18n.get('COMMAND_HELP_NODM')); });
    }

    /* eslint-disable no-restricted-syntax, no-prototype-builtins */
    async buildHelp(msg, settings) {
        const help = {};

        await Promise.all(this.client.commands.map((command) =>
            this.client.inhibitors.run(msg, command, true, settings)
                .then(() => {
                    if (!help.hasOwnProperty(command.category)) help[command.category] = {};
                    if (!help[command.category].hasOwnProperty(command.subCategory)) help[command.category][command.subCategory] = [];
                    help[command.category][command.subCategory].push(`→ \`${settings.master.prefix}${command.name}\` :: **${command.description}**\n`);
                    return;
                })
                .catch(() => {
                    // noop
                })
        ));

        return help;
    }

};
