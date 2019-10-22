import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { UserRichDisplay } from '../../../lib/structures/UserRichDisplay';
import { Databases } from '../../../lib/types/constants/Constants';
import { GuildSettings } from '../../../lib/types/settings/GuildSettings';
import { UserSettings } from '../../../lib/types/settings/UserSettings';
import { EMOJIS } from '../../../lib/util/constants';
import { getColor } from '../../../lib/util/util';
import { RawBannerSettings } from '../../../lib/types/settings/raw/RawBannerSettings';

const CDN_URL = 'https://cdn.skyra.pw/img/banners/';

export default class extends SkyraCommand {

	private readonly banners: Map<string, BannerCache> = new Map();
	private readonly listPrompt = this.definePrompt('<all|user>');
	private display: UserRichDisplay | null = null;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['banners'],
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_BANNER_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_BANNER_EXTENDED'),
			requiredPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			subcommands: true,
			usage: '<buy|reset|set|show:default> (banner:banner)',
			usageDelim: ' '
		});

		this.createCustomResolver('banner', (arg, _, message, [type]) => {
			if (type === 'show' || type === 'reset') return undefined;
			if (!arg) throw message.language.tget('COMMAND_BANNER_MISSING');
			const banner = this.banners.get(arg);
			if (banner) return banner;
			throw message.language.tget('COMMAND_BANNER_NOTEXISTS', message.guild!.settings.get(GuildSettings.Prefix));
		});
	}

	public async buy(message: KlasaMessage, [banner]: [BannerCache]) {
		const banners = new Set(message.author!.settings.get(UserSettings.BannerList));
		if (banners.has(banner.id)) throw message.language.tget('COMMAND_BANNER_BOUGHT', message.guild!.settings.get(GuildSettings.Prefix), banner.id);

		const money = message.author!.settings.get(UserSettings.Money);
		if (money < banner.price) throw message.language.tget('COMMAND_BANNER_MONEY', money, banner.price);

		const accepted = await this._prompt(message, banner);
		if (!accepted) throw message.language.tget('COMMAND_BANNER_PAYMENT_CANCELLED');

		if (money < banner.price) throw message.language.tget('COMMAND_BANNER_MONEY', money, banner.price);

		banners.add(banner.id);

		const user = await this.client.users.fetch(banner.author);
		await user.settings.sync();

		await Promise.all([
			message.author!.settings.update([[UserSettings.Money, money - banner.price], [UserSettings.BannerList, [...banners]]], { arrayAction: 'overwrite' }),
			user.settings.increase(UserSettings.Money, banner.price * 0.1)
		]);

		return message.sendLocale('COMMAND_BANNER_BUY', [banner.title]);
	}

	public async reset(message: KlasaMessage) {
		const banners = message.author!.settings.get(UserSettings.BannerList);
		if (!banners.length) throw message.language.tget('COMMAND_BANNER_USERLIST_EMPTY', message.guild!.settings.get(GuildSettings.Prefix));
		if (message.author!.settings.get(UserSettings.ThemeProfile) === '0001') throw message.language.tget('COMMAND_BANNER_RESET_DEFAULT');

		await message.author!.settings.update(UserSettings.ThemeProfile, '0001');
		return message.sendLocale('COMMAND_BANNER_RESET');
	}

	public async set(message: KlasaMessage, [banner]: [BannerCache]) {
		const banners = message.author!.settings.get(UserSettings.BannerList);
		if (!banners.length) throw message.language.tget('COMMAND_BANNER_USERLIST_EMPTY', message.guild!.settings.get(GuildSettings.Prefix));
		if (!banners.includes(banner.id)) throw message.language.tget('COMMAND_BANNER_SET_NOT_BOUGHT');

		await message.author!.settings.update(UserSettings.ThemeProfile, banner.id);
		return message.sendLocale('COMMAND_BANNER_SET', [banner.title]);
	}

	public async show(message: KlasaMessage) {
		const [response] = await this.listPrompt.createPrompt(message).run(message.language.tget('COMMAND_BANNER_PROMPT'));
		return response === 'all' ? this._buyList(message) : this._userList(message);
	}

	public async init() {
		const banners = await this.client.providers.default.getAll(Databases.Banners) as RawBannerSettings[];
		const display = new UserRichDisplay(new MessageEmbed().setColor(0xFFAB40));
		for (const banner of banners) {
			this.banners.set(banner.id, {
				author: banner.author_id,
				authorName: null,
				id: banner.id,
				group: banner.group,
				price: banner.price,
				title: banner.title
			});

			display.addPage((template: MessageEmbed) => template
				.setImage(`${CDN_URL}${banner.id}.png`)
				.setTitle(banner.title)
				.setDescription(`• ID: \`${banner.id}\`\n• ${banner.price}${EMOJIS.SHINY}`));
		}

		this.display = display;
	}

	private _buyList(message: KlasaMessage) {
		return this._runDisplay(message, this.display!);
	}

	private _userList(message: KlasaMessage) {
		const prefix = message.guild!.settings.get(GuildSettings.Prefix);
		const banners = new Set(message.author!.settings.get(UserSettings.BannerList));
		if (!banners.size) throw message.language.tget('COMMAND_BANNER_USERLIST_EMPTY', prefix);

		const display = new UserRichDisplay(new MessageEmbed().setColor(getColor(message) || 0xFFAB2D));
		for (const id of banners) {
			const banner = this.banners.get(id);
			if (banner) {
				display.addPage((template: MessageEmbed) => template
					.setImage(`${CDN_URL}${banner.id}.png`)
					.setTitle(banner.title)
					.setDescription(`• ID: \`${banner.id}\`\n• ${banner.price}${EMOJIS.SHINY}`));
			}
		}

		return this._runDisplay(message, display);
	}

	private async _runDisplay(message: KlasaMessage, display: UserRichDisplay) {
		const response = await message.sendEmbed(new MessageEmbed({ description: message.language.tget('SYSTEM_LOADING'), color: getColor(message) || 0xFFAB2D })) as KlasaMessage;
		await display.start(response, message.author!.id);
		return response;
	}

	private async _prompt(message: KlasaMessage, banner: BannerCache) {
		const embed = new MessageEmbed()
			.setColor(getColor(message) || 0xFFAB2D)
			.setDescription([
				`**Title**: ${banner.title} (\`${banner.id}\`)`,
				`**Price**: ${banner.price}${EMOJIS.SHINY}`
			].join('\n'))
			.setImage(`${CDN_URL}${banner.id}.png`)
			.setTimestamp();

		return message.ask({ embed });
	}

}

interface BannerCache {
	author: string;
	authorName: null;
	id: string;
	group: string;
	price: number;
	title: string;
}
