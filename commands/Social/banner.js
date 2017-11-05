const { structures: { Command } } = require('../../index');
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

	async run(msg, [action, value = null], settings, i18n) {
		return this[action](msg, value, settings, i18n);
	}

	list(msg, value, settings, i18n) {
		const banners = msg.author.profile.bannerList || [];
		if (banners.length === 0) throw i18n.get('COMMAND_BANNER_LIST_EMPTY', settings.master.prefix);
		const output = [];
		for (let i = 0; i < banners.length; i++) {
			const banner = availableBanners[banners[i]];
			output[i] = [banner.id, banner.title];
		}
		let index = 1;
		if (isNaN(value) === false) index = parseInt(value);
		const list = listify(output, { index, length: 8 });
		return msg.send(list, { code: 'asciidoc' });
	}

	async set(msg, value, settings, i18n) {
		const banners = msg.author.profile.bannerList || [];
		if (value === null) throw i18n.get('COMMAND_BANNER_SET_INPUT_NULL');
		if (banners.length === 0) throw i18n.get('COMMAND_BANNER_LIST_EMPTY', settings.master.prefix);

		banners.push('0001');
		if (banners.includes(value) === false) throw i18n.get('COMMAND_BANNER_SET_NOT_BOUGHT');

		await msg.author.profile.update({ banners: { theme: value } }).catch(Command.handleError);
		return msg.send(i18n.get('COMMAND_BANNER_SET', availableBanners[value] ? availableBanners[value].title : value));
	}

	async buylist(msg, value) {
		let index = 1;
		if (value && isNaN(value) === false) index = parseInt(value);
		const list = listify(Object.entries(availableBanners).map(([k, v]) => [k, `${v.title.padEnd(25, ' ') + v.price} S`]), { index, length: 8 });
		return msg.send(list, { code: 'asciidoc' });
	}

	async buy(msg, value, settings, i18n) {
		if (value === null)
			throw i18n.get('COMMAND_BANNER_BUY_INPUT_NULL');

		const selected = availableBanners[value] || null;

		if (selected === null)
			throw i18n.get('COMMAND_BANNER_BUY_NOT_EXISTS', settings.master.prefix);

		const banners = msg.author.profile.bannerList || [];

		if (banners.includes(selected.id))
			throw i18n.get('COMMAND_BANNER_BUY_BOUGHT', settings.master.prefix, selected.id);

		if (msg.author.profile.money < selected.price)
			throw i18n.get('COMMAND_BANNER_BUY_MONEY', msg.author.profile.money, selected.price, Command.shiny(msg));

		return this.prompt(msg, selected, i18n)
			.then(async () => {
				banners.push(selected.id);
				const user = await this.client.users.fetch(selected.author).catch(Command.handleError);
				await msg.author.profile.update({ money: msg.author.profile.money - selected.price, bannerList: banners }).catch(Command.handleError);
				await user.profile.add(selected.price * 0.1).catch(Command.handleError);
				return msg.send(i18n.get('COMMAND_BANNER_BUY', selected.title));
			})
			.catch(() => msg.alert(i18n.get('COMMAND_BANNER_BUY_PAYMENT_CANCELLED')));
	}

	async prompt(msg, banner, i18n) {
		const user = await this.client.users.fetch(banner.author).catch(Command.handleError);
		const TITLES = i18n.COMMAND_BANNER_PROMPT || this.client.languages.get('en-US').language.COMMAND_BANNER_PROMPT;

		const embed = new MessageEmbed()
			.setColor(msg.color)
			.setDescription([
				`**${TITLES.AUTHOR}**: ${user.tag}`,
				`**${TITLES.TITLE}**: ${banner.title} (\`${banner.id}\`)`,
				`**${TITLES.PRICE}**: ${banner.price}${Command.shiny(msg)}`
			].join('\n'))
			.setImage(`http://kyradiscord.weebly.com/files/theme/banners/${banner.id}.png`)
			.setTimestamp();

		return msg.prompt({ embed });
	}

};
