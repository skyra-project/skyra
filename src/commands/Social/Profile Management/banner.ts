import { UserEntity } from '@lib/database/entities/UserEntity';
import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { CdnUrls } from '@lib/types/Constants';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { roundNumber } from '@sapphire/utilities';
import { ApplyOptions, requiredPermissions } from '@skyra/decorators';
import { BrandingColors, Emojis } from '@utils/constants';
import { pickRandom } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { getManager } from 'typeorm';

const CDN_URL = CdnUrls.BannersBasePath;

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['banners', 'wallpaper', 'wallpapers', 'background', 'backgrounds'],
	bucket: 2,
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Social.BannerDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Social.BannerExtended),
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
		const { users } = await DbSet.connect();
		const author = await users.ensureProfile(message.author.id);
		const banners = new Set(author.profile.banners);
		if (banners.has(banner.id))
			throw message.language.get(LanguageKeys.Commands.Social.BannerBought, {
				prefix: message.guild!.settings.get(GuildSettings.Prefix),
				banner: banner.id
			});

		if (author.money < banner.price)
			throw message.language.get(LanguageKeys.Commands.Social.BannerMoney, { money: author.money, cost: banner.price });

		const accepted = await this.prompt(message, banner);
		if (!accepted) throw message.language.get(LanguageKeys.Commands.Social.BannerPaymentCancelled);

		if (author.money < banner.price)
			throw message.language.get(LanguageKeys.Commands.Social.BannerMoney, { money: author.money, cost: banner.price });

		await getManager().transaction(async (em) => {
			const existingbannerAuthor = await em.findOne(UserEntity, banner.author);
			if (existingbannerAuthor) {
				existingbannerAuthor.money += roundNumber(banner.price * 0.1);
				await em.save(existingbannerAuthor);
			} else {
				await em.insert(UserEntity, {
					id: banner.author,
					money: roundNumber(banner.price * 0.1)
				});
			}

			banners.add(banner.id);
			author.profile.banners = [...banners];
			author.money -= banner.price;
			await em.save(author);
		});

		return message.sendLocale(LanguageKeys.Commands.Social.BannerBuy, [{ banner: banner.title }]);
	}

	public async reset(message: KlasaMessage) {
		const { users } = await DbSet.connect();
		await users.lock([message.author.id], async (id) => {
			const user = await users.ensureProfile(id);
			if (!user.profile.banners.length)
				throw message.language.get(LanguageKeys.Commands.Social.BannerUserlistEmpty, {
					prefix: message.guild!.settings.get(GuildSettings.Prefix)
				});
			if (user.profile.bannerProfile === '0001') throw message.language.get(LanguageKeys.Commands.Social.BannerResetDefault);

			user.profile.bannerProfile = '0001';
			return user.save();
		});

		return message.sendLocale(LanguageKeys.Commands.Social.BannerReset);
	}

	public async set(message: KlasaMessage, [banner]: [BannerCache]) {
		const { users } = await DbSet.connect();
		await users.lock([message.author.id], async (id) => {
			const user = await users.ensureProfile(id);
			if (!user.profile.banners.length)
				throw message.language.get(LanguageKeys.Commands.Social.BannerUserlistEmpty, {
					prefix: message.guild!.settings.get(GuildSettings.Prefix)
				});
			if (!user.profile.banners.includes(banner.id)) throw message.language.get(LanguageKeys.Commands.Social.BannerSetNotBought);

			user.profile.bannerProfile = banner.id;
			return user.save();
		});

		return message.sendLocale(LanguageKeys.Commands.Social.BannerSet, [{ banner: banner.title }]);
	}

	@requiredPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	public async show(message: KlasaMessage) {
		const [response] = await this.listPrompt.createPrompt(message).run(message.language.get(LanguageKeys.Commands.Social.BannerPrompt));
		return response === 'all' ? this.buyList(message) : this.userList(message);
	}

	public async init() {
		this.createCustomResolver('banner', (arg, _, message, [type]) => {
			if (type === 'show' || type === 'reset') return undefined;
			if (!arg) throw message.language.get(LanguageKeys.Commands.Social.BannerMissing, type);
			const banner = this.banners.get(arg);
			if (banner) return banner;
			throw message.language.get(LanguageKeys.Commands.Social.BannerNotexists, { prefix: message.guild!.settings.get(GuildSettings.Prefix) });
		});

		const { banners } = await DbSet.connect();
		const entries = await banners.find();
		const display = new UserRichDisplay(new MessageEmbed().setColor(BrandingColors.Primary));
		for (const banner of entries) {
			this.banners.set(banner.id, {
				author: banner.authorID,
				authorName: null,
				id: banner.id,
				group: banner.group,
				price: banner.price,
				title: banner.title
			});

			display.addPage((template: MessageEmbed) =>
				template
					.setImage(`${CDN_URL}${banner.id}.png`)
					.setTitle(banner.title)
					.setDescription(`• ID: \`${banner.id}\`\n• ${banner.price}${Emojis.Shiny}`)
			);
		}

		this.display = display;
	}

	private buyList(message: KlasaMessage) {
		return this.runDisplay(message, this.display);
	}

	private async userList(message: KlasaMessage) {
		const prefix = message.guild!.settings.get(GuildSettings.Prefix);
		const { users } = await DbSet.connect();
		const user = await users.ensureProfile(message.author.id);
		const banners = new Set(user.profile.banners);
		if (!banners.size) throw message.language.get(LanguageKeys.Commands.Social.BannerUserlistEmpty, { prefix });

		const display = new UserRichDisplay(new MessageEmbed().setColor(await DbSet.fetchColor(message)));
		for (const id of banners) {
			const banner = this.banners.get(id);
			if (banner) {
				display.addPage((template: MessageEmbed) =>
					template
						.setImage(`${CDN_URL}${banner.id}.png`)
						.setTitle(banner.title)
						.setDescription(`• ID: \`${banner.id}\`\n• ${banner.price}${Emojis.Shiny}`)
				);
			}
		}

		return this.runDisplay(message, display);
	}

	private async runDisplay(message: KlasaMessage, display: UserRichDisplay | null) {
		if (display !== null) {
			const response = await message.sendEmbed(
				new MessageEmbed({ description: pickRandom(message.language.get(LanguageKeys.System.Loading)), color: BrandingColors.Secondary })
			);
			await display.start(response, message.author.id);
			return response;
		}
	}

	private async prompt(message: KlasaMessage, banner: BannerCache) {
		const embed = new MessageEmbed()
			.setColor(BrandingColors.Secondary)
			.setDescription([`**Title**: ${banner.title} (\`${banner.id}\`)`, `**Price**: ${banner.price}${Emojis.Shiny}`].join('\n'))
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
