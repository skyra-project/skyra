const Command = require("../../classes/command");

module.exports = class DirectMessage extends Command {

    constructor(...args) {
        super(...args, "dm", {
            permLevel: 10,
            mode: 2,

            usage: "<user:user> <message:string> [...]",
            usageDelim: " ",
            description: "Send a Direct Message throught Skyra.",
        });
    }

    async run(msg, [user, ...content]) {
        const attachment = msg.attachments.size > 0 ? msg.attachments.first().url : null;
        const options = {};
        if (attachment) options.files = [{ attachment }];

        return user.send(content.join(" "), options)
            .then(() => msg.alert(`Message successfully sent to ${user}`))
            .catch(() => msg.alert(`I am sorry, I could not send the message to ${user}`));
    }

};
