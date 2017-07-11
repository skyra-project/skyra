const Command = require("../../classes/command");

module.exports = class Content extends Command {

    constructor(...args) {
        super(...args, "content", {
            guildOnly: true,
            mode: 2,

            usage: "<message:string{17,21}> [channel:channel]",
            usageDelim: " ",
            description: "Get messages' raw content.",
        });
    }

    async run(msg, [searchMessage, channel = msg.channel]) { // eslint-disable-line class-methods-use-this
        if (!/[0-9]{17,21}/.test(searchMessage)) throw "I was expecting a Message Snowflake (Message ID).";
        const m = await channel.fetchMessage(searchMessage);

        const attachments = m.attachments.size > 0 ? m.attachments.map(att => `<${att.url}>`) : null;

        return msg.send(m.content + (attachments ? `\n\n\n=============\n<Attachments>\n${attachments.join("\n")}` : ""), { code: "md" });
    }

};
