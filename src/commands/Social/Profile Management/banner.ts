import { DbSet, GuildSettings, UserEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { UserPaginatedMessage } from '#lib/structures/UserPaginatedMessage';
import { GuildMessage } from '#lib/types';
import { CdnUrls } from '#lib/types/Constants';
import { BrandingColors, Emojis } from '#utils/constants';
import { pickRandom } from '#utils/util';
import { roundNumber } from '@sapphire/utilities';
import { ApplyOptions, requiredPermissions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';

const CDN_URL = CdnUrls.BannersBasePath;

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['banners', 'wallpaper', 'wallpapers', 'background', 'backgrounds'],
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Social.BannerDescription,
	extendedHelp: LanguageKeys.Commands.Social.BannerExtended,
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
	private display: UserPaginatedMessage = null!;

	@requiredPermissions(['EMBED_LINKS'])
	public async buy(message: GuildMessage, [banner]: [BannerCache]) {
		const [{ users }, [prefix, t]] = await Promise.all([
			DbSet.connect(),
			message.guild.readSettings((settings) => [settings[GuildSettings.Prefix], settings.getLanguage()] as const)
		]);

		const author = await users.ensureProfile(message.author.id);
		const banners = new Set(author.profile.banners);
		if (banners.has(banner.id)) {
			throw t(LanguageKeys.Commands.Social.BannerBought, { prefix, banner: banner.id });
		}

		if (author.money < banner.price) throw t(LanguageKeys.Commands.Social.BannerMoney, { money: author.money, cost: banner.price });

		const accepted = await this.prompt(message, banner);
		if (!accepted) throw t(LanguageKeys.Commands.Social.BannerPaymentCancelled);

		await users.manager.transaction(async (em) => {
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

		return message.send(t(LanguageKeys.Commands.Social.BannerBuy, { banner: banner.title }));
	}

	public async reset(message: GuildMessage) {
		const [{ users }, [prefix, t]] = await Promise.all([
			DbSet.connect(),
			message.guild.readSettings((settings) => [settings[GuildSettings.Prefix], settings.getLanguage()] as const)
		]);

		await users.lock([message.author.id], async (id) => {
			const user = await users.ensureProfile(id);
			if (!user.profile.banners.length) throw t(LanguageKeys.Commands.Social.BannerUserListEmpty, { prefix });
			if (user.profile.bannerProfile === '0001') throw t(LanguageKeys.Commands.Social.BannerResetDefault);

			user.profile.bannerProfile = '0001';
			return user.save();
		});

		return message.send(t(LanguageKeys.Commands.Social.BannerReset));
	}

	public async set(message: GuildMessage, [banner]: [BannerCache]) {
		const [{ users }, [prefix, t]] = await Promise.all([
			DbSet.connect(),
			message.guild.readSettings((settings) => [settings[GuildSettings.Prefix], settings.getLanguage()] as const)
		]);

		await users.lock([message.author.id], async (id) => {
			const user = await users.ensureProfile(id);
			if (!user.profile.banners.length) throw t(LanguageKeys.Commands.Social.BannerUserListEmpty, { prefix });
			if (!user.profile.banners.includes(banner.id)) throw t(LanguageKeys.Commands.Social.BannerSetNotBought);

			user.profile.bannerProfile = banner.id;
			return user.save();
		});

		return message.send(t(LanguageKeys.Commands.Social.BannerSet, { banner: banner.title }));
	}

	@requiredPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	public async show(message: GuildMessage) {
		const [response] = await this.listPrompt.createPrompt(message).run(await message.resolveKey(LanguageKeys.Commands.Social.BannerPrompt));
		return response === 'all' ? this.buyList(message) : this.userList(message);
	}

	public async init() {
		this.createCustomResolver('banner', async (arg, _, message, [type]) => {
			if (type === 'show' || type === 'reset') return undefined;
			if (!arg) throw await message.resolveKey(LanguageKeys.Commands.Social.BannerMissing, type);
			const banner = this.banners.get(arg);
			if (banner) return banner;
			throw await message.resolveKey(LanguageKeys.Commands.Social.BannerNotExists, {
				prefix: await message.guild!.readSettings(GuildSettings.Prefix)
			});
		});

		const { banners } = await DbSet.connect();
		const entries = await banners.find();
		const display = new UserPaginatedMessage({ template: new MessageEmbed().setColor(BrandingColors.Primary) });
		for (const banner of entries) {
			this.banners.set(banner.id, {
				author: banner.authorID,
				authorName: null,
				id: banner.id,
				group: banner.group,
				price: banner.price,
				title: banner.title
			});

			display.addTemplatedEmbedPage((template: MessageEmbed) =>
				template
					.setImage(`${CDN_URL}${banner.id}.png`)
					.setTitle(banner.title)
					.setDescription(`• ID: \`${banner.id}\`\n• ${banner.price}${Emojis.Shiny}`)
			);
		}

		this.display = display;
	}

	private async buyList(message: GuildMessage) {
		return this.runDisplay(message, await message.fetchT(), this.display.clone());
	}

	private async userList(message: GuildMessage) {
		const [prefix, t] = await message.guild.readSettings((settings) => [settings[GuildSettings.Prefix], settings.getLanguage()]);

		const { users } = await DbSet.connect();
		const user = await users.ensureProfile(message.author.id);
		const banners = new Set(user.profile.banners);
		if (!banners.size) throw t(LanguageKeys.Commands.Social.BannerUserListEmpty, { prefix });

		const display = new UserPaginatedMessage({ template: new MessageEmbed().setColor(await DbSet.fetchColor(message)) });
		for (const id of banners) {
			const banner = this.banners.get(id);
			if (banner) {
				display.addTemplatedEmbedPage((template: MessageEmbed) =>
					template
						.setImage(`${CDN_URL}${banner.id}.png`)
						.setTitle(banner.title)
						.setDescription(`• ID: \`${banner.id}\`\n• ${banner.price}${Emojis.Shiny}`)
				);
			}
		}

		return this.runDisplay(message, t, display);
	}

	private async runDisplay(message: GuildMessage, t: TFunction, display: UserPaginatedMessage) {
		if (display !== null) {
			const response = (await message.send(
				new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
			)) as GuildMessage;
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
