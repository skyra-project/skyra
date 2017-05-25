exports.options = {
  tax: 20,
};

/* eslint-disable no-throw-literal */
exports.run = async (client, msg, [money]) => {
  const pool = client.bettings.get(msg.guild.id);
  const taxed = money * (this.options.tax / 100);

  if (!pool) throw "There's no betting pool active.";
  else if (money <= 0) throw "Amount of money should be above 0.";
  else if (msg.author.profile.money < money) throw `You can't pay with money you don't have. Current currency: ${msg.author.profile.money}`;
  else if (msg.author.profile.money < taxed) throw `A tax of ${this.options.tax}% is applied here, you need ${taxed} but you have: ${msg.author.profile.money}`;

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
  permLevel: 0,
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
