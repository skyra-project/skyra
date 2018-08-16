const { Command, RichDisplay, constants: { TIME: { MINUTE }, EMOJIS: { SHINY } }, Collection, MessageEmbed } = require('../../../index');

const PROMPT_TIME = MINUTE * 5;
const CDN_URL = 'https://cdn.skyradiscord.com/img/banners/';

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['banners'],
			requiredPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_BANNER_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_BANNER_EXTENDED'),
			runIn: ['text'],
			usage: '[list|buy|reset|set] (banner:banner)',
			usageDelim: ' '
		});

		this.createCustomResolver('banner', (arg, possible, msg, [type = 'list']) => {
			if (type === 'list' || type === 'reset') return undefined;
			if (!arg) throw msg.language.get('COMMAND_BANNER_MISSING');
			const banner = this.banners.get(arg);
			if (banner) return banner;
			throw msg.language.get('COMMAND_BANNER_NOTEXISTS');
		});

		this.banners = new Map();
		this.collectors = new Collection();
		this.display = null;
		this.listPrompt = this.definePrompt('<all|user>');
	}

	run(msg, [type = 'list', banner]) {
		switch (type) {
			case 'list': return this._list(msg);
			case 'reset': return this.reset(msg);
			case 'buy': return this.buy(msg, banner);
			case 'set': return this.set(msg, banner);
			default: return null;
		}
	}

	async reset(msg) {
		const banners = msg.author.settings.bannerList;
		if (!banners.length) throw msg.language.get('COMMAND_BANNER_USERLIST_EMPTY');
		if (msg.author.settings.themeProfile === '0001') throw msg.language.get('COMMAND_BANNER_RESET_DEFAULT');

		await msg.author.settings.update('themeProfile', '0001');
		return msg.sendLocale('COMMAND_BANNER_RESET');
	}

	async set(msg, banner) {
		const banners = msg.author.settings.bannerList;
		if (!banners.length) throw msg.language.get('COMMAND_BANNER_USERLIST_EMPTY');
		if (!banners.includes(banner.id)) throw msg.language.get('COMMAND_BANNER_SET_NOT_BOUGHT');

		await msg.author.settings.update('themeProfile', banner.id);
		return msg.sendLocale('COMMAND_BANNER_SET', [banner.title]);
	}

	async buy(msg, banner) {
		const banners = new Set(msg.author.settings.bannerList);
		if (banners.has(banner.id)) throw msg.language.get('COMMAND_BANNER_BOUGHT', msg.guild.settings.prefix, banner.id);

		if (msg.author.settings.money < banner.price) throw msg.language.get('COMMAND_BANNER_MONEY', msg.author.settings.money, banner.price);

		const accepted = await this.prompt(msg, banner);
		if (!accepted) throw msg.language.get('COMMAND_BANNER_PAYMENT_CANCELLED');

		banners.add(banner.id);

		const user = await this.client.users.fetch(banner.author);
		await user.settings.sync();

		await Promise.all([
			msg.author.settings.update([['money', msg.author.settings.money - banner.price], ['bannerList', [...banners]]]),
			user.settings.update('money', user.settings.money + (banner.price * 0.1))
		]);

		return msg.sendLocale('COMMAND_BANNER_BUY', [banner.title]);
	}

	_buyList(msg) {
		return this._runDisplay(msg, this.display);
	}

	_userList(msg) {
		const banners = new Set(msg.author.settings.bannerList);
		if (!banners.size) throw msg.language.get('COMMAND_BANNER_USERLIST_EMPTY', msg.guild.settings.prefix);

		const display = new RichDisplay(new MessageEmbed().setColor(0xFFAB40));
		for (const id of banners) {
			const banner = this.banners.get(id);
			if (banner) {
				display.addPage(template => template
					.setImage(`${CDN_URL}${banner.id}.png`)
					.setTitle(banner.title)
					.setDescription(`• ID: \`${banner.id}\`\n• ${banner.price}${SHINY}`));
			}
		}

		return this._runDisplay(msg, display);
	}

	async _runDisplay(msg, display) {
		const collectorID = msg.author.id;
		const existing = this.collectors.get(collectorID);
		if (existing) existing.stop();

		const collector = await display.run(await msg.channel.send(msg.language.get('SYSTEM_LOADING')), {
			filter: (_, user) => user.id === msg.author.id,
			time: PROMPT_TIME
		});
		this.collectors.set(collectorID, collector);
		collector.once('end', () => this.collectors.delete(collectorID));
	}

	async _list(msg) {
		const [response] = await this.listPrompt.createPrompt(msg).run(msg.language.get('COMMAND_BANNER_PROMPT'));
		return response === 'all' ? this._buyList(msg) : this._userList(msg);
	}

	async prompt(msg, banner) {
		const embed = new MessageEmbed()
			.setColor(msg.member.displayColor)
			.setDescription([
				`**Title**: ${banner.title} (\`${banner.id}\`)`,
				`**Price**: ${banner.price}${SHINY}`
			].join('\n'))
			.setImage(`${CDN_URL}${banner.id}.png`)
			.setTimestamp();

		return msg.ask({ embed });
	}

	async init() {
		const table = await this.client.providers.default.getAll('banners');
		const display = new RichDisplay(new MessageEmbed().setColor(0xFFAB40));
		for (const list of table) {
			for (const banner of list.banners) {
				this.banners.set(banner.id, {
					author: banner.author,
					authorName: null,
					id: banner.id,
					list: list.id,
					price: banner.price,
					title: banner.title
				});

				display.addPage(template => template
					.setImage(`${CDN_URL}${banner.id}.png`)
					.setTitle(banner.title)
					.setDescription(`• ID: \`${banner.id}\`\n• ${banner.price}${SHINY}`));
			}
		}

		this.display = display;
	}

};
