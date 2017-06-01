exports.run = async (client, msg, [limit, ...filter]) => {
  let mFilter;
  let messages;
  if (filter.length) {
    filter = filter.join(" ");
    switch (filter) {
      case "invite": mFilter = m => m.content.search(/(discord\.gg\/.+|discordapp\.com\/invite\/.+)/i) !== -1;
        break;
      case "nopin": mFilter = m => !m.pinned;
        break;
      case "bots": mFilter = m => m.author.bot;
        break;
      case "you": mFilter = m => m.author.id === m.client.user.id;
        break;
      case "me": mFilter = m => m.author.id === msg.author.id;
        break;
      case "upload": mFilter = m => m.attachments.size !== 0;
        break;
      case "links": mFilter = m => m.content.search(/https?:\/\/[^ /.]+\.[^ /.]+/) !== -1;
        break;
      default: {
        const user = await client.funcs.search.User(filter, msg.guild);
        mFilter = m => m.author.id === user.id;
      }
    }
    messages = await msg.channel.fetchMessages({ limit }).then(msgs => msgs.filter(mFilter));
  } else {
    messages = await msg.channel.fetchMessages({ limit });
  }
  switch (messages.size) {
    case 0: throw new Error("Messages not found.");
    case 1: messages.first().nuke();
      break;
    default: await msg.channel.bulkDelete(messages);
  }
  await msg.alert(`Dear ${msg.author}, I cleaned up ${messages.size} messages from ${limit}.`);
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
  usage: "<number:int{2,100}> [invite|nopin|bots|you|me|upload|links|user:str] [...]",
  usageDelim: " ",
};
