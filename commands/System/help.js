const { Command } = require("../../index");

/* eslint-disable class-methods-use-this */
module.exports = class Help extends Command {

    constructor(...args) {
        super(...args, "help", {
            aliases: ["commands"],
            mode: 2,

            usage: "[command:string]",
            description: "Display help for all or a single command.",
        });
    }

    async run(msg, [cmd]) {
        const method = this.client.user.bot ? "author" : "channel";
        if (cmd) {
            cmd = this.client.commands.get(cmd) || this.client.commands.get(this.client.aliases.get(cmd));
            if (!cmd) return msg.send("❌ | Unknown command, please run the help command with no arguments to get a list of them all.");
            const info = Command.strip`
                = ${cmd.help.name} =
                ${cmd.help.description}
                Usage :: ${cmd.usage.fullUsage(msg)}
                Extended Help :: ${cmd.help.extendedHelp || "No extended help available."}
            `;
            return msg.send(info, { code: "asciidoc" });
        }
        const help = this.buildHelp(this.client, msg);
        const categories = Object.keys(help);
        const helpMessage = [];
        for (let cat = 0; cat < categories.length; cat++) {
            helpMessage.push(`**${categories[cat]} Commands**: \`\`\`asciidoc`);
            const subCategories = Object.keys(help[categories[cat]]);
            for (let subCat = 0; subCat < subCategories.length; subCat++) helpMessage.push(`= ${subCategories[subCat]} =`, `${help[categories[cat]][subCategories[subCat]].join("\n")}\n`);
            helpMessage.push("```\n\u200b");
        }
        return msg[method].send(helpMessage, { split: { char: "\u200b" } })
            .then(() => { if (msg.channel.type !== "dm") msg.send("📥 | Commands have been sent to your DMs."); })
            .catch(() => { if (msg.channel.type !== "dm") msg.send("❌ | You have DMs disabled, I couldn't send you the commands in DMs."); });
    }

    /* eslint-disable no-restricted-syntax, no-prototype-builtins */
    buildHelp(msg) {
        const help = {};

        const commandNames = Array.from(this.client.commands.keys());
        const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);

        for (const command of this.client.commands.values()) {
            if (this.runCommandInhibitors(this.client, msg, command)) {
                const cat = command.help.category;
                const subcat = command.help.subCategory;
                if (!help.hasOwnProperty(cat)) help[cat] = {};
                if (!help[cat].hasOwnProperty(subcat)) help[cat][subcat] = [];
                help[cat][subcat].push(`${msg.guildSettings.prefix}${command.help.name.padEnd(longest)} :: ${command.help.description}`);
            }
        }

        return help;
    }

    runCommandInhibitors(msg, command) {
        return !this.client.commandInhibitors.some((inhibitor) => {
            if (!inhibitor.conf.spamProtection && inhibitor.conf.enabled) return inhibitor.run(this.client, msg, command);
            return false;
        });
    }

};
