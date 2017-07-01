exports.run = async (client, msg, [cmd]) => {
    const method = client.user.bot ? "author" : "channel";
    if (cmd) {
        cmd = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
        if (!cmd) return msg.sendMessage("❌ | Unknown command, please run the help command with no arguments to get a list of them all.");
        const info = [
            `= ${cmd.help.name} = `,
            cmd.help.description,
            `usage :: ${cmd.usage.fullUsage(msg)}`,
            "Extended Help ::",
            cmd.help.extendedHelp || "No extended help available.",
        ].join("\n");
        return msg.sendMessage(info, { code: "asciidoc" });
    }
    const help = this.buildHelp(client, msg);
    const categories = Object.keys(help);
    const helpMessage = [];
    for (let cat = 0; cat < categories.length; cat++) {
        helpMessage.push(`**${categories[cat]} Commands**: \`\`\`asciidoc`);
        const subCategories = Object.keys(help[categories[cat]]);
        for (let subCat = 0; subCat < subCategories.length; subCat++) helpMessage.push(`= ${subCategories[subCat]} =`, `${help[categories[cat]][subCategories[subCat]].join("\n")}\n`);
        helpMessage.push("```\n\u200b");
    }
    return msg[method].send(helpMessage, { split: { char: "\u200b" } })
    .then(() => { if (msg.channel.type !== "dm" && client.user.bot) msg.sendMessage("📥 | Commands have been sent to your DMs."); })
    .catch(() => { if (msg.channel.type !== "dm" && client.user.bot) msg.sendMessage("❌ | You have DMs disabled, I couldn't send you the commands in DMs."); });
};

exports.conf = {
    enabled: true,
    runIn: ["text", "dm", "group"],
    aliases: [],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
};

exports.help = {
    name: "help",
    description: "Display help for a command.",
    usage: "[command:string]",
    usageDelim: "",
};

/* eslint-disable no-restricted-syntax, no-prototype-builtins */
exports.buildHelp = (client, msg) => {
    const help = {};

    const commandNames = Array.from(client.commands.keys());
    const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);

    for (const command of client.commands.values()) {
        if (this.runCommandInhibitors(client, msg, command)) {
            const cat = command.help.category;
            const subcat = command.help.subCategory;
            if (!help.hasOwnProperty(cat)) help[cat] = {};
            if (!help[cat].hasOwnProperty(subcat)) help[cat][subcat] = [];
            help[cat][subcat].push(`${msg.guildSettings.prefix}${command.help.name.padEnd(longest)} :: ${command.help.description}`);
        }
    }

    return help;
};

exports.runCommandInhibitors = (client, msg, command) => !client.commandInhibitors.some((inhibitor) => {
    if (!inhibitor.conf.spamProtection && inhibitor.conf.enabled) return inhibitor.run(client, msg, command);
    return false;
});
