const Command = require("../../classes/command");

module.exports = class Ping extends Command {

    constructor(...args) {
        super(...args, "ping", { description: "Runs a connection test to Discord." });
    }

    async run(msg) {
        const message = await msg.channel.send("Ping?");
        return message.edit(`Pong! (took: ${message.createdTimestamp - msg.createdTimestamp}ms)`);
    }

};
