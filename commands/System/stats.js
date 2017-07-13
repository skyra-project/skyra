const { Command } = require("../../index");
const { version } = require("discord.js");
const { uptime, loadavg } = require("os");
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
        return msg.send([
            "= STATISTICS =",
            `• Users      :: ${this.client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()}`,
            `• Servers    :: ${this.client.guilds.size.toLocaleString()}`,
            `• Channels   :: ${this.client.channels.size.toLocaleString()}`,
            `• Discord.js :: v${version}`,
            "",
            "= UPTIME =",
            `• Host       :: ${moment.duration(uptime() * 1000).format("d[ days], h[:]mm[:]ss")}`,
            `• Total      :: ${moment.duration(process.uptime() * 1000).format("d[ days], h[:]mm[:]ss")}`,
            `• Client     :: ${moment.duration(this.client.uptime).format("d[ days], h[:]mm[:]ss")}`,
            "",
            "= HOST USAGE =",
            `• CPU Load   :: ${Math.round(loadavg()[0] * 10000) / 100}%`,
            `• RAM +Node  :: ${Math.round(100 * (process.memoryUsage().heapTotal / 1048576)) / 100}MB`,
            `• RAM Usage  :: ${Math.round(100 * (process.memoryUsage().heapUsed / 1048576)) / 100}MB`,
        ], { code: "asciidoc" });
    }

};
