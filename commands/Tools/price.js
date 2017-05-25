const snekfetch = require("snekfetch");

exports.run = async (client, msg, [coin, currency]) => {
  const c1 = coin.toUpperCase();
  const c2 = currency.toUpperCase();
  try {
    const res = await snekfetch.get(`https://min-api.cryptocompare.com/data/price?fsym=${c1}&tsyms=${c2}`);
    await msg.reply(!res.body[c2] ?
        "There was an error, please make sure you specified an appropriate coin and currency." :
        `Current ${c1} price is ${res.body[c2]} ${c2}`);
  } catch (e) {
    msg.reply("There was an error, please make sure you specified an appropriate coin and currency.");
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 1,
  cooldown: 30,
};

exports.help = {
  name: "price",
  description: "Returns the current price of a Cryptocurrency Coin.",
  usage: "<coin:str> <currency:str>",
  usageDelim: " ",
};
