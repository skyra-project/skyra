const { User: fetchUser } = require("../../functions/search");

exports.getFilter = async (client, msg, input) => {
    switch (input) {
        case "invite": return m => m.content.search(/(discord\.gg\/.+|discordapp\.com\/invite\/.+)/i) !== -1;
        case "nopin": return m => !m.pinned;
        case "bots": return m => m.author.bot;
        case "you": return m => m.author.id === m.client.user.id;
        case "me": return m => m.author.id === msg.author.id;
        case "upload": return m => m.attachments.size !== 0;
        case "links": return m => m.content.search(/https?:\/\/[^ /.]+\.[^ /.]+/) !== -1;
        default: {
            const user = await fetchUser(input, msg.guild);
            return m => m.author.id === user.id;
        }
    }
};

exports.run = async (client, msg, [limit, ...filter]) => {
    let mFilter;
    let messages;
    if (filter.length) {
        mFilter = await this.getFilter(client, msg, filter.join(" ").toLowerCase());
        messages = await msg.channel.fetchMessages({ limit }).then(msgs => msgs.filter(mFilter));
    } else {
        messages = await msg.channel.fetchMessages({ limit });
    }
    switch (messages.size) {
        case 0: throw "I could not find messages with this filter.";
        case 1: messages.first().nuke();
            break;
        default: await msg.channel.bulkDelete(messages);
    }

    return msg.alert(`Dear ${msg.author}, I cleaned up ${messages.size} messages from ${limit}.`);
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: [],
    permLevel: 2,
    botPerms: ["MANAGE_MESSAGES"],
    requiredFuncs: [],
    spam: false,
    mode: 2,
    cooldown: 5,
};

exports.help = {
    name: "prune",
    description: "Prune 'x' messages.",
    usage: "<number:int{2,100}> [invite|nopin|bots|you|me|upload|links|user:string] [...]",
    usageDelim: " ",
};
