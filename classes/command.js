const ParsedUsage = require("./parsedUsage");

module.exports = class Command {

    constructor(client, dir, name, {
            aliases = [],
            guildOnly = false,
            permLevel = 0,
            botPerms = [],
            mode = 0,
            spam = false,
            cooldown = 0,

            usage = "",
            usageDelim = undefined,
            description,
            extendedHelp = null,
    }) {
        this.client = client;
        this.dir = dir;
        this.conf = {
            aliases,
            guildOnly,
            permLevel,
            botPerms,
            mode,
            spam,
            cooldown,
        };
        this.help = {
            name,
            description,
            usage,
            usageDelim,
            extendedHelp,
        };
        this.cooldown = new Map();
        this.usage = new ParsedUsage(client, this);
    }

    run() {
        // Defined in extension Classes
    }

    init() {
        // Optionally defined in extension Classes
    }

    static sendDM(msg, content, options) {
        return msg.author.send(content, options)
            .then(() => (msg.guild ? msg.send(`Dear ${msg.author}, I have send you the message in DMs.`).catch(Command.handleError) : true))
            .catch(() => msg.send("I am sorry, I could not send the message in DMs.").catch(Command.handleError));
    }

    static handleError(err) {
        throw err;
    }

    static hasPermission(msg, permission) {
        return msg.channel.permissionsFor(msg.guild.me).has(permission);
    }

    static codeBlock(lang, expression) {
        return `\`\`\`${lang}\n${expression || "\u200b"}\`\`\``;
    }

    /**
     * Resolve an string
     * @static
     * @param {string} string The string to resolve.
     * @returns {string}
     */
    static strip(string) {
        string = string.replace(/^\n/, "");
        const length = /^[ ]*/.exec(string)[0].length;
        return length > 0 ? string.split("\n").map(line => line.slice(length)).join("\n") : string;
    }

    static joinLines(string) {
        string = string.replace(/^\n/, "");
        return string.split("\n").map(line => (line.length > 0 ? line.trim() : "\n\n")).join(" ");
    }

};
