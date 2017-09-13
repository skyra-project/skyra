const { Command } = require('../../index');
const { MessageEmbed } = require('discord.js');

const availableBanners = require('../../assets/banners.json');
const listify = require('../../functions/listify');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            botPerms: ['EMBED_LINKS'],
            mode: 1,
            spam: true,
            cooldown: 5,

            usage: '<list|buy|set|buylist> [banner:string]',
            usageDelim: ' ',
            description: 'Buy, list, or set the banners.'
        });
    }

    async run(msg, [action, value = null]) {
        return this[action](msg, value);
    }

    list(msg, value) {
        const banners = msg.author.profile.bannerList || [];
        if (banners.length === 0) return msg.send(`Dear ${msg.author}, you don't have a banner, check the buylist and buy one.`);
        const output = [];
        for (let i = 0; i < banners.length; i++) {
            const banner = availableBanners[banners[i]];
            output[i] = [banner.id, banner.title];
        }
        let index = 1;
        if (!isNaN(value)) index = parseInt(value);
        const list = listify(output, { index, length: 8 });
        return msg.send(list, { code: 'asciidoc' });
    }

    async set(msg, value) {
        const banners = msg.author.profile.bannerList || [];
        if (!value) throw 'you must specify a banner to set.';
        if (!banners[0]) throw "you don't have a banner.";
        banners.push('0001');
        if (!banners.includes(value)) throw "you don't have this banner.";
        await msg.author.profile.update({ banners: { theme: value } }).catch(Command.handleError);
        return msg.send(`Dear ${msg.author}, you have successfully set your banner to: ${availableBanners[value] ? availableBanners[value].title : value}`);
    }

    async buylist(msg, value) {
        let index = 1;
        if (!isNaN(parseInt(value))) index = parseInt(value);
        const list = listify(Object.entries(availableBanners).map(([k, v]) => [k, `${v.title.padEnd(25, ' ') + v.price} S`]), { index, length: 8 });
        return msg.send(list, { code: 'asciidoc' });
    }

    async buy(msg, value) {
        const banners = msg.author.profile.bannerList || [];
        if (!value) return msg.send('You must specify a banner to buy.');
        const selected = availableBanners[value] || null;
        if (!selected) return msg.send('This banner does not exist.');
        else if (banners.includes(selected.id)) return msg.send('You already have this banner.');
        else if (msg.author.profile.money < selected.price) return msg.send(`You don't have enough money to buy this banner. You have ${msg.author.profile.money}${Command.shiny(msg)}, the banner costs ${selected.price}${Command.shiny(msg)}`); // eslint-disable-line max-len
        return this.prompt(msg, selected)
            .then(async () => {
                banners.push(selected.id);
                const user = await this.client.fetchUser(selected.author).catch(Command.handleError);
                await msg.author.profile.update({ money: msg.author.profile.money - selected.price, bannerList: banners }).catch(Command.handleError);
                await user.profile.add(selected.price * 0.1).catch(Command.handleError);
                return msg.alert(`Dear ${msg.author}, you have successfully bought the banner "${selected.title}"`);
            })
            .catch(() => msg.alert(`Dear ${msg.author}, you cancelled your payment.`));
    }

    async prompt(msg, banner) {
        const user = await this.client.fetchUser(banner.author).catch(Command.handleError);
        const embed = new MessageEmbed()
            .setColor(msg.color)
            .setDescription(
                `**Author**: ${user.tag}\n`
                + `**Title**: ${banner.title} (\`${banner.id}\`)\n`
                + `**Price**: ${banner.price}${Command.shiny(msg)}`,
            )
            .setImage(`http://kyradiscord.weebly.com/files/theme/banners/${banner.id}.png`)
            .setTimestamp();

        return msg.prompt({ embed });
    }

};
