const ParsedUsage = require("./parsedUsage");

module.exports = class Command {

    constructor(client, dir, name, { permLevel = 0, guildOnly = true, aliases = [], botPerms = [], description, usage = "", usageDelim = undefined }) {
        this.client = client;
        this.dir = dir;
        this.conf = {
            aliases,
            botPerms,
            guildOnly,
            permLevel,
        };
        this.help = {
            name,
            description,
            usage,
            usageDelim,
        };
        this.cooldown = new Map();
        this.usage = new ParsedUsage(client, this);
    }

    codeBlock(lang, expression) {
        return `\`\`\`${lang}\n${expression || "\u200b"}\`\`\``;
    }

    run() {
        // Defined in extension Classes
    }

    init() {
        // Optionally defined in extension Classes
    }

};
