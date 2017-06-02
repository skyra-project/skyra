/* eslint-disable import/no-dynamic-require, no-restricted-syntax, no-throw-literal */
exports.run = async (client, msg, [action, value = null]) => {
  try {
    const { availableBanners } = client;
    const banners = msg.author.profile.bannerList || [];
    switch (action) {
      case "list": {
        await msg.send(banners[0] ? `List of banners:\n${banners.map(b => `\`${b}\` ${availableBanners[b] ? availableBanners[b].title : ""}`).join("\n")}` : "You don't have a banner.");
        break;
      }
      case "set": {
        if (!value) throw "You must specify a banner to set.";
        else if (!banners[0]) throw "You don't have a banner.";
        else if (!banners.includes(value)) throw "You don't have this banner.";
        await msg.author.profile.update({ banners: { theme: value } });
        await msg.send(`Dear ${msg.author}, you have successfully set your banner to: ${availableBanners[value] ? availableBanners[value].title : value}`);
        break;
      }
      case "buylist": {
        const output = [];
        for (const obj in availableBanners) {
          if (obj in availableBanners) {
            const element = availableBanners[obj];
            output.push(`\`${element.id}\` ${element.title}`);
          }
        }
        await msg.send(output.join("\n"));
        break;
      }
      case "buy": {
        if (!value) throw "You must specify a banner to buy.";
        const selected = availableBanners[value] || null;
        if (!selected) throw "This banner does not exist.";
        else if (banners.includes(selected.id)) throw "You already have this banner.";
        else if (msg.author.profile.money < selected.price) throw `You don't have enough money to buy this banner. You have ${msg.author.profile.money}, the banner costs ${selected.price}`;
        this.prompt(client, msg, selected)
          .then(async () => {
            banners.push(selected.id);
            const user = await client.fetchUser(selected.author);
            await msg.author.profile.update({ money: selected.price - msg.author.profile.money, bannerList: banners });
            await user.profile.add(selected.price * 0.1);
            await msg.alert(`Dear ${msg.author}, you have successfully bought the banner "${selected.title}"`);
          })
          .catch(() => msg.alert(`Dear ${msg.author}, you cancelled your payment.`));
        break;
      }
      default:
        break;
    }
  } catch (e) {
    msg.send(e);
  }
};

exports.prompt = async (client, msg, banner) => {
  const user = await client.fetchUser(banner.author);
  const embed = new client.methods.Embed()
    .setColor(msg.color)
    .setDescription([
      `**Author**: ${user.tag}`,
      `**Title**: ${banner.title} (\`${banner.id}\`)`,
      `**Price**: ${banner.price}`,
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
  description: "Check how many reputation points do you have.",
  usage: "<list|buy|set|buylist> [banner:str]",
  usageDelim: " ",
  extendedHelp: "",
};
