/* eslint-disable no-throw-literal */
exports.run = async (client, msg, [money, ...search]) => {
  try {
    const user = await client.search.User(search.join(" "), msg.guild);

    if (msg.author.id === user.id) throw "You can't pay yourself.";
    else if (money <= 0) throw "Amount of money should be above 0.";
    else if (msg.author.profile.money < money) throw `You can't pay with money you don't have. Current currency: ${msg.author.profile.money}`;

    await msg.Prompt(`Dear ${msg.author}, you're going to pay ${money}₪ to ${user.username}, do you accept?`);

    await client.Social.add(user, money);
    await client.Social.use(msg.author, money);

    msg.alert(`Dear ${msg.author}, you have just paid ${money}₪ to **${user.username}**`);
  } catch (e) {
    if (e) msg.error(e);
    else msg.alert(`Dear ${msg.author}, you have just cancelled the transfer.`);
  }
};


exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 1,
  cooldown: 60,
};

exports.help = {
  name: "pay",
  description: "Pay somebody with your shekels.",
  usage: "<amount:int> <user:str> [...]",
  usageDelim: " ",
  extendedHelp: [
    "Businessmen! Today is payday!",
    "",
    "This command will prompt you before you pay somebody, and make sure you have enough money to transfer!",
  ].join("\n"),
};
