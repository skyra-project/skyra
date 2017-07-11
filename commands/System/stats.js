const Command = require("../../classes/command");

const { version: discordVersion } = require("discord.js");
const moment = require("moment");
require("moment-duration-format");

/* eslint-disable class-methods-use-this */
module.exports = class Status extends Command {

    constructor(...args) {
        super(...args, "status", {
            aliases: ["stats", "sts"],
            mode: 2,

            description: "Provides some details about the bot and stats.",
        });
    }

    async run(msg) {
        const duration = moment.duration(this.client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
        return msg.send([
            "= STATISTICS =",
            "",
            `• Mem Usage  :: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
            `• Uptime     :: ${duration}`,
            `• Users      :: ${this.client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()}`,
            `• Servers    :: ${this.client.guilds.size.toLocaleString()}`,
            `• Channels   :: ${this.client.channels.size.toLocaleString()}`,
            `• Discord.js :: v${discordVersion}`,
        ], { code: "asciidoc" });
    }

};
