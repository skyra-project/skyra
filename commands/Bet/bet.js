exports.options = {
  tax: 20,
};

exports.run = async (client, msg, [money]) => {
  const pool = client.bettings.get(msg.guild.id);
  const taxed = money * (this.options.tax / 100);

  if (!pool) throw "there's no betting pool active.";
  else if (money <= 0) throw "amount of money should be above 0.";
  else if (msg.author.profile.money < money) throw `you can't pay with money you don't have. Current currency: ${msg.author.profile.money}${msg.shiny}`;
  else if (msg.author.profile.money < taxed) throw `a tax of ${this.options.tax}% is applied here, you need ${taxed} but you have: ${msg.author.profile.money}${msg.shiny}`;

  pool.users.set(msg.author.id, money);
  await client.Social.use(msg.author, taxed);
};

exports.init = (client) => {
  client.bettings = new Map();
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 10,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 1,
  cooldown: 5,
};

exports.help = {
  name: "bet",
  description: "Deposit money in a betting pool.",
  usage: "<money:int>",
  usageDelim: "",
  extendedHelp: "",
};
