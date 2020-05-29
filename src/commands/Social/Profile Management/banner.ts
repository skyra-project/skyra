import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { Databases } from '@lib/types/constants/Constants';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { RawBannerSettings } from '@lib/types/settings/raw/RawBannerSettings';
import { UserSettings } from '@lib/types/settings/UserSettings';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors, Emojis } from '@utils/constants';
import { getColor, requiredPermissions } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

const CDN_URL = 'https://cdn.skyra.pw/img/banners/';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['banners', 'wallpaper', 'wallpapers', 'background', 'backgrounds'],
	bucket: 2,
	cooldown: 10,
	description: language => language.tget('COMMAND_BANNER_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_BANNER_EXTENDED'),
	requiredPermissions: ['MANAGE_MESSAGES'],
	runIn: ['text'],
	subcommands: true,
	usage: '<buy|reset|set|show:default> (banner:banner)',
	usageDelim: ' '
})
export default class extends SkyraCommand {

	// eslint-disable-next-line @typescript-eslint/no-invalid-this
	private readonly listPrompt = this.definePrompt('<all|user>');
	private readonly banners: Map<string, BannerCache> = new Map();
	private display: UserRichDisplay | null = null;

	@requiredPermissions(['EMBED_LINKS'])
	public async buy(message: KlasaMessage, [banner]: [BannerCache]) {
		const banners = new Set(message.author.settings.get(UserSettings.BannerList));
		if (banners.has(banner.id)) throw message.language.tget('COMMAND_BANNER_BOUGHT', message.guild!.settings.get(GuildSettings.Prefix), banner.id);

		const money = message.author.settings.get(UserSettings.Money);
		if (money < banner.price) throw message.language.tget('COMMAND_BANNER_MONEY', money, banner.price);

		const accepted = await this.prompt(message, banner);
		if (!accepted) throw message.language.tget('COMMAND_BANNER_PAYMENT_CANCELLED');

		if (money < banner.price) throw message.language.tget('COMMAND_BANNER_MONEY', money, banner.price);

		banners.add(banner.id);

		const user = await this.client.users.fetch(banner.author);
		await user.settings.sync();

		await Promise.all([
			message.author.settings.update([[UserSettings.Money, money - banner.price], [UserSettings.BannerList, [...banners]]], {
				arrayAction: 'overwrite',
				extraContext: { author: message.author.id }
			}),
			user.settings.increase(UserSettings.Money, banner.price * 0.1, {
				extraContext: { author: message.author.id }
			})
		]);

		return message.sendLocale('COMMAND_BANNER_BUY', [banner.title]);
	}

	public async reset(message: KlasaMessage) {
		const banners = message.author.settings.get(UserSettings.BannerList);
		if (!banners.length) throw message.language.tget('COMMAND_BANNER_USERLIST_EMPTY', message.guild!.settings.get(GuildSettings.Prefix));
		if (message.author.settings.get(UserSettings.ThemeProfile) === '0001') throw message.language.tget('COMMAND_BANNER_RESET_DEFAULT');

		await message.author.settings.update(UserSettings.ThemeProfile, '0001', {
			extraContext: { author: message.author.id }
		});
		return message.sendLocale('COMMAND_BANNER_RESET');
	}

	public async set(message: KlasaMessage, [banner]: [BannerCache]) {
		const banners = message.author.settings.get(UserSettings.BannerList);
		if (!banners.length) throw message.language.tget('COMMAND_BANNER_USERLIST_EMPTY', message.guild!.settings.get(GuildSettings.Prefix));
		if (!banners.includes(banner.id)) throw message.language.tget('COMMAND_BANNER_SET_NOT_BOUGHT');

		await message.author.settings.update(UserSettings.ThemeProfile, banner.id, {
			extraContext: { author: message.author.id }
		});
		return message.sendLocale('COMMAND_BANNER_SET', [banner.title]);
	}

	@requiredPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	public async show(message: KlasaMessage) {
		const [response] = await this.listPrompt.createPrompt(message).run(message.language.tget('COMMAND_BANNER_PROMPT'));
		return response === 'all' ? this.buyList(message) : this.userList(message);
	}

	public async init() {
		this.createCustomResolver('banner', (arg, _, message, [type]) => {
			if (type === 'show' || type === 'reset') return undefined;
			if (!arg) throw message.language.tget('COMMAND_BANNER_MISSING', type);
			const banner = this.banners.get(arg);
			if (banner) return banner;
			throw message.language.tget('COMMAND_BANNER_NOTEXISTS', message.guild!.settings.get(GuildSettings.Prefix));
		});

		const banners = await this.client.providers.default!.getAll(Databases.Banners) as RawBannerSettings[];
		const display = new UserRichDisplay(new MessageEmbed().setColor(BrandingColors.Primary));
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
				.setDescription(`• ID: \`${banner.id}\`\n• ${banner.price}${Emojis.Shiny}`));
		}

		this.display = display;
	}

	private buyList(message: KlasaMessage) {
		return this.runDisplay(message, this.display);
	}

	private userList(message: KlasaMessage) {
		const prefix = message.guild!.settings.get(GuildSettings.Prefix);
		const banners = new Set(message.author.settings.get(UserSettings.BannerList));
		if (!banners.size) throw message.language.tget('COMMAND_BANNER_USERLIST_EMPTY', prefix);

		const display = new UserRichDisplay(new MessageEmbed().setColor(getColor(message)));
		for (const id of banners) {
			const banner = this.banners.get(id);
			if (banner) {
				display.addPage((template: MessageEmbed) => template
					.setImage(`${CDN_URL}${banner.id}.png`)
					.setTitle(banner.title)
					.setDescription(`• ID: \`${banner.id}\`\n• ${banner.price}${Emojis.Shiny}`));
			}
		}

		return this.runDisplay(message, display);
	}

	private async runDisplay(message: KlasaMessage, display: UserRichDisplay | null) {
		if (display !== null) {
			const response = await message.sendEmbed(new MessageEmbed({ description: message.language.tget('SYSTEM_LOADING'), color: BrandingColors.Secondary }));
			await display.start(response, message.author.id);
			return response;
		}
	}

	private async prompt(message: KlasaMessage, banner: BannerCache) {
		const embed = new MessageEmbed()
			.setColor(BrandingColors.Secondary)
			.setDescription([
				`**Title**: ${banner.title} (\`${banner.id}\`)`,
				`**Price**: ${banner.price}${Emojis.Shiny}`
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
