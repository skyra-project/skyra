/* eslint-disable import/no-dynamic-require, no-restricted-syntax */
exports.run = async (client, msg, [action, value = null]) => {
  const { availableBanners } = client;
  const banners = msg.author.profile.bannerList || [];
  switch (action) {
    case "list": return msg.send(banners[0] ? `List of banners:\n${banners.map(b => `\`${b}\` ${availableBanners[b] ? availableBanners[b].title : ""}`).join("\n")}` : "You don't have a banner.");
    case "set": {
      if (!value) throw "you must specify a banner to set.";
      if (!banners[0]) throw "you don't have a banner.";
      banners.push("0001");
      if (!banners.includes(value)) throw "you don't have this banner.";
      await msg.author.profile.update({ banners: { theme: value } });
      return msg.send(`Dear ${msg.author}, you have successfully set your banner to: ${availableBanners[value] ? availableBanners[value].title : value}`);
    }
    case "buylist": {
      const output = [];
      for (const obj in availableBanners) {
        if (obj in availableBanners) {
          const element = availableBanners[obj];
          output.push(`\`${element.id}\` ${element.title}`);
        }
      }
      return msg.send(output.join("\n"));
    }
    case "buy": {
      if (!value) return msg.send("You must specify a banner to buy.");
      const selected = availableBanners[value] || null;
      if (!selected) return msg.send("This banner does not exist.");
      else if (banners.includes(selected.id)) return msg.send("You already have this banner.");
      else if (msg.author.profile.money < selected.price) return msg.send(`You don't have enough money to buy this banner. You have ${msg.author.profile.money}${msg.shiny}, the banner costs ${selected.price}${msg.shiny}`);
      return this.prompt(client, msg, selected)
        .then(async () => {
          banners.push(selected.id);
          const user = await client.fetchUser(selected.author);
          await msg.author.profile.update({ money: msg.author.profile.money - selected.price, bannerList: banners });
          await user.profile.add(selected.price * 0.1);
          return msg.alert(`Dear ${msg.author}, you have successfully bought the banner "${selected.title}"`);
        })
        .catch(() => msg.alert(`Dear ${msg.author}, you cancelled your payment.`));
    }
    default:
      return null;
  }
};

exports.prompt = async (client, msg, banner) => {
  const user = await client.fetchUser(banner.author);
  const embed = new client.methods.Embed()
    .setColor(msg.color)
    .setDescription([
      `**Author**: ${user.tag}`,
      `**Title**: ${banner.title} (\`${banner.id}\`)`,
      `**Price**: ${banner.price}${msg.shiny}`,
    ].join("\n"))
    .setImage(`http://kyradiscord.weebly.com/files/theme/banners/${banner.id}.png`)
    .setTimestamp();

  await msg.prompt({ embed });
};

exports.init = (client) => { client.availableBanners = require(`${client.clientBaseDir}assets/banners.json`); };

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: ["banners"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: true,
  mode: 1,
  cooldown: 5,
};

exports.help = {
  name: "banner",
  description: "Buy, list, or set the banners.",
  usage: "<list|buy|set|buylist> [banner:str]",
  usageDelim: " ",
  extendedHelp: "",
};
