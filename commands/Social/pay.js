exports.run = async (client, msg, [money, ...search]) => {
  const user = await client.funcs.search.User(search.join(" "), msg.guild);

  if (msg.author.id === user.id) throw "you can't pay yourself.";
  else if (money <= 0) throw "amount of money should be above 0.";
  else if (msg.author.profile.money < money) throw `you can't pay with money you don't have. Current currency: ${msg.author.profile.money}${msg.shiny}`;

  return msg.prompt(`Dear ${msg.author}, you're going to pay ${money}${msg.shiny} to ${user.username}, do you accept?`)
    .then(async () => {
      await user.profile.add(money);
      await msg.author.profile.use(money);
      return msg.alert(`Dear ${msg.author}, you have just paid ${money}${msg.shiny} to **${user.username}**`);
    })
    .catch(() => msg.alert(`Dear ${msg.author}, you have just cancelled the transfer.`));
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
  cooldown: 5,
};

exports.help = {
  name: "pay",
  description: "Pay somebody with your shekels.",
  usage: "<amount:int> <user:string> [...]",
  usageDelim: " ",
  extendedHelp: [
    "Businessmen! Today is payday!",
    "",
    "This command will prompt you before you pay somebody, and make sure you have enough money to transfer!",
  ].join("\n"),
};
