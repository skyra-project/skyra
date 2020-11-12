import { DbSet, GuildSettings, UserEntity } from '@lib/database';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { GuildMessage } from '@lib/types';
import { CdnUrls } from '@lib/types/Constants';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { roundNumber } from '@sapphire/utilities';
import { ApplyOptions, requiredPermissions } from '@skyra/decorators';
import { BrandingColors, Emojis } from '@utils/constants';
import { pickRandom } from '@utils/util';
import { MessageEmbed } from 'discord.js';
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
	public async buy(message: GuildMessage, [banner]: [BannerCache]) {
		const [{ users }, [prefix, language]] = await Promise.all([
			DbSet.connect(),
			message.guild.readSettings((settings) => [settings[GuildSettings.Prefix], settings.getLanguage()] as const)
		]);

		const author = await users.ensureProfile(message.author.id);
		const banners = new Set(author.profile.banners);
		if (banners.has(banner.id)) {
			throw language.get(LanguageKeys.Commands.Social.BannerBought, { prefix, banner: banner.id });
		}

		if (author.money < banner.price) throw language.get(LanguageKeys.Commands.Social.BannerMoney, { money: author.money, cost: banner.price });

		const accepted = await this.prompt(message, banner);
		if (!accepted) throw language.get(LanguageKeys.Commands.Social.BannerPaymentCancelled);

		if (author.money < banner.price) throw language.get(LanguageKeys.Commands.Social.BannerMoney, { money: author.money, cost: banner.price });

		await getManager().transaction(async (em) => {
			const existingBannerAuthor = await em.findOne(UserEntity, banner.author);
			if (existingBannerAuthor) {
				existingBannerAuthor.money += roundNumber(banner.price * 0.1);
				await em.save(existingBannerAuthor);
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

		return message.send(language.get(LanguageKeys.Commands.Social.BannerBuy, { banner: banner.title }));
	}

	public async reset(message: GuildMessage) {
		const [{ users }, [prefix, language]] = await Promise.all([
			DbSet.connect(),
			message.guild.readSettings((settings) => [settings[GuildSettings.Prefix], settings.getLanguage()] as const)
		]);

		await users.lock([message.author.id], async (id) => {
			const user = await users.ensureProfile(id);
			if (!user.profile.banners.length) throw language.get(LanguageKeys.Commands.Social.BannerUserListEmpty, { prefix });
			if (user.profile.bannerProfile === '0001') throw language.get(LanguageKeys.Commands.Social.BannerResetDefault);

			user.profile.bannerProfile = '0001';
			return user.save();
		});

		return message.send(language.get(LanguageKeys.Commands.Social.BannerReset));
	}

	public async set(message: GuildMessage, [banner]: [BannerCache]) {
		const [{ users }, [prefix, language]] = await Promise.all([
			DbSet.connect(),
			message.guild.readSettings((settings) => [settings[GuildSettings.Prefix], settings.getLanguage()] as const)
		]);

		await users.lock([message.author.id], async (id) => {
			const user = await users.ensureProfile(id);
			if (!user.profile.banners.length) throw language.get(LanguageKeys.Commands.Social.BannerUserListEmpty, { prefix });
			if (!user.profile.banners.includes(banner.id)) throw language.get(LanguageKeys.Commands.Social.BannerSetNotBought);

			user.profile.bannerProfile = banner.id;
			return user.save();
		});

		return message.send(language.get(LanguageKeys.Commands.Social.BannerSet, { banner: banner.title }));
	}

	@requiredPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	public async show(message: GuildMessage) {
		const [response] = await this.listPrompt.createPrompt(message).run(await message.fetchLocale(LanguageKeys.Commands.Social.BannerPrompt));
		return response === 'all' ? this.buyList(message) : this.userList(message);
	}

	public async init() {
		this.createCustomResolver('banner', async (arg, _, message, [type]) => {
			if (type === 'show' || type === 'reset') return undefined;
			if (!arg) throw await message.fetchLocale(LanguageKeys.Commands.Social.BannerMissing, type);
			const banner = this.banners.get(arg);
			if (banner) return banner;
			throw await message.fetchLocale(LanguageKeys.Commands.Social.BannerNotexists, {
				prefix: await message.guild!.readSettings(GuildSettings.Prefix)
			});
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

	private buyList(message: GuildMessage) {
		return this.runDisplay(message, this.display);
	}

	private async userList(message: GuildMessage) {
		const [prefix, language] = await message.guild.readSettings((settings) => [settings[GuildSettings.Prefix], settings.getLanguage()]);

		const { users } = await DbSet.connect();
		const user = await users.ensureProfile(message.author.id);
		const banners = new Set(user.profile.banners);
		if (!banners.size) throw language.get(LanguageKeys.Commands.Social.BannerUserListEmpty, { prefix });

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

	private async runDisplay(message: GuildMessage, display: UserRichDisplay | null) {
		if (display !== null) {
			const response = await message.sendEmbed(
				new MessageEmbed({ description: pickRandom(await message.fetchLocale(LanguageKeys.System.Loading)), color: BrandingColors.Secondary })
			);
			await display.start(response, message.author.id);
			return response;
		}

		return undefined;
	}

	private async prompt(message: GuildMessage, banner: BannerCache) {
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
