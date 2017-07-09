const availableBanners = require("../../assets/banners.json");
const listify = require("../../functions/listify");
const { shiny } = require("../../utils/assets");

exports.run = async (client, msg, [action, value = null]) => {
    const banners = msg.author.profile.bannerList || [];
    switch (action) {
        case "list": {
            if (banners.length === 0) return msg.send(`Dear ${msg.author}, you don't have a banner, check the buylist and buy one.`);
            const output = [];
            for (let i = 0; i < banners.length; i++) {
                const banner = availableBanners[banners[i]];
                output[i] = [banner.id, banner.title];
            }
            let index = 1;
            if (!isNaN(parseInt(value))) index = parseInt(value);
            const list = listify(output, { index, length: 8 });
            return msg.send(list, { code: "asciidoc" });
        }
        case "set": {
            if (!value) throw "you must specify a banner to set.";
            if (!banners[0]) throw "you don't have a banner.";
            banners.push("0001");
            if (!banners.includes(value)) throw "you don't have this banner.";
            await msg.author.profile.update({ banners: { theme: value } });
            return msg.send(`Dear ${msg.author}, you have successfully set your banner to: ${availableBanners[value] ? availableBanners[value].title : value}`);
        }
        case "buylist": {
            let index = 1;
            if (!isNaN(parseInt(value))) index = parseInt(value);
            const list = listify(Object.entries(availableBanners).map(([k, v]) => [k, `${v.title.padEnd(25, " ") + v.price} S`]), { index, length: 8 });
            return msg.send(list, { code: "asciidoc" });
        }
        case "buy": {
            if (!value) return msg.send("You must specify a banner to buy.");
            const selected = availableBanners[value] || null;
            if (!selected) return msg.send("This banner does not exist.");
            else if (banners.includes(selected.id)) return msg.send("You already have this banner.");
            else if (msg.author.profile.money < selected.price) return msg.send(`You don't have enough money to buy this banner. You have ${msg.author.profile.money}${shiny(msg)}, the banner costs ${selected.price}${shiny(msg)}`);
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
        .setDescription(
            `**Author**: ${user.tag}\n` +
            `**Title**: ${banner.title} (\`${banner.id}\`)\n` +
            `**Price**: ${banner.price}${shiny(msg)}`,
        )
        .setImage(`http://kyradiscord.weebly.com/files/theme/banners/${banner.id}.png`)
        .setTimestamp();

    return msg.prompt({ embed });
};

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
    usage: "<list|buy|set|buylist> [banner:string]",
    usageDelim: " ",
    extendedHelp: "",
};
