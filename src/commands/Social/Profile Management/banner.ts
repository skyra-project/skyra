import { DbSet, GuildSettings, UserEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { CdnUrls } from '#lib/types/Constants';
import { BrandingColors, Emojis } from '#utils/constants';
import { requiresPermissions } from '#utils/decorators';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, CommandContext } from '@sapphire/framework';
import { roundNumber } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

const CDN_URL = CdnUrls.BannersBasePath;

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['banners', 'wallpaper', 'wallpapers', 'background', 'backgrounds'],
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Social.BannerDescription,
	extendedHelp: LanguageKeys.Commands.Social.BannerExtended,
	permissions: ['MANAGE_MESSAGES'],
	runIn: ['text'],
	subCommands: ['buy', 'reset', 'set', { input: 'show', default: true }]
})
export class UserCommand extends SkyraCommand {
	private display: UserPaginatedMessage = null!;

	@requiresPermissions(['EMBED_LINKS'])
	public async buy(message: GuildMessage, args: SkyraCommand.Args, { prefix }: CommandContext) {
		const [{ users }, banner] = await Promise.all([DbSet.connect(), args.pick(UserCommand.banner)]);
		const { t } = args;

		const author = await users.ensureProfile(message.author.id);
		const banners = new Set(author.profile.banners);
		if (banners.has(banner.id)) {
			this.error(LanguageKeys.Commands.Social.BannerBought, { prefix, banner: banner.id });
		}

		if (author.money < banner.price) this.error(LanguageKeys.Commands.Social.BannerMoney, { money: author.money, cost: banner.price });

		const accepted = await this.prompt(message, banner);
		if (!accepted) this.error(LanguageKeys.Commands.Social.BannerPaymentCancelled);

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

	public async reset(message: GuildMessage, args: SkyraCommand.Args, { prefix }: CommandContext) {
		const { users } = await DbSet.connect();
		const { t } = args;

		await users.lock([message.author.id], async (id) => {
			const user = await users.ensureProfile(id);
			if (!user.profile.banners.length) this.error(LanguageKeys.Commands.Social.BannerUserListEmpty, { prefix });
			if (user.profile.bannerProfile === '0001') this.error(LanguageKeys.Commands.Social.BannerResetDefault);

			user.profile.bannerProfile = '0001';
			return user.save();
		});

		return message.send(t(LanguageKeys.Commands.Social.BannerReset));
	}

	public async set(message: GuildMessage, args: SkyraCommand.Args, { prefix }: CommandContext) {
		const [{ users }, banner] = await Promise.all([DbSet.connect(), args.pick(UserCommand.banner)]);
		const { t } = args;

		await users.lock([message.author.id], async (id) => {
			const user = await users.ensureProfile(id);
			if (!user.profile.banners.length) this.error(LanguageKeys.Commands.Social.BannerUserListEmpty, { prefix });
			if (!user.profile.banners.includes(banner.id)) this.error(LanguageKeys.Commands.Social.BannerSetNotBought);

			user.profile.bannerProfile = banner.id;
			return user.save();
		});

		return message.send(t(LanguageKeys.Commands.Social.BannerSet, { banner: banner.title }));
	}

	@requiresPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	public async show(message: GuildMessage, args: SkyraCommand.Args) {
		const allOrUser = args.finished ? 'all' : await args.pick(UserCommand.allOrUser);
		return allOrUser === 'all' ? this.buyList(message, args.t) : this.userList(message, args.t);
	}

	public async onLoad() {
		const { banners } = await DbSet.connect();
		const entries = await banners.find();
		const display = new UserPaginatedMessage({ template: new MessageEmbed().setColor(BrandingColors.Primary) });
		for (const banner of entries) {
			UserCommand.banners.set(banner.id, {
				author: banner.authorID,
				authorName: null,
				id: banner.id,
				group: banner.group,
				price: banner.price,
				title: banner.title
			});

			display.addPageEmbed((template) =>
				template
					.setImage(`${CDN_URL}${banner.id}.png`)
					.setTitle(banner.title)
					.setDescription(`• ID: \`${banner.id}\`\n• ${banner.price}${Emojis.Shiny}`)
			);
		}

		this.display = display;
	}

	private async buyList(message: GuildMessage, t: TFunction) {
		return this.runDisplay(message, t, this.display.clone());
	}

	private async userList(message: GuildMessage, t: TFunction) {
		const prefix = await message.guild.readSettings(GuildSettings.Prefix);

		const { users } = await DbSet.connect();
		const user = await users.ensureProfile(message.author.id);
		const banners = new Set(user.profile.banners);
		if (!banners.size) this.error(LanguageKeys.Commands.Social.BannerUserListEmpty, { prefix });

		const display = new UserPaginatedMessage({ template: new MessageEmbed().setColor(await DbSet.fetchColor(message)) });
		for (const id of banners) {
			const banner = UserCommand.banners.get(id);
			if (banner) {
				display.addPageEmbed((template) =>
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
		const response = await sendLoadingMessage(message, t);
		await display.start(response as GuildMessage, message.author);
		return response;
	}

	private async prompt(message: GuildMessage, banner: BannerCache) {
		const embed = new MessageEmbed()
			.setColor(BrandingColors.Secondary)
			.setDescription([`**Title**: ${banner.title} (\`${banner.id}\`)`, `**Price**: ${banner.price}${Emojis.Shiny}`].join('\n'))
			.setImage(`${CDN_URL}${banner.id}.png`)
			.setTimestamp();

		return message.ask({ embed });
	}

	private static readonly banners: Map<string, BannerCache> = new Map();

	private static banner = Args.make<BannerCache>((parameter, { argument, commandContext }) => {
		const banner = this.banners.get(parameter);
		if (banner) return Args.ok(banner);

		return Args.error({
			parameter,
			argument,
			identifier: LanguageKeys.Commands.Social.BannerNotExists,
			context: { prefix: commandContext.prefix }
		});
	});

	private static allOrUser = Args.make<'all' | 'user'>((parameter, { argument }) => {
		const lowerCasedParameter = parameter.toLowerCase();
		if (lowerCasedParameter === 'all' || lowerCasedParameter === 'user') return Args.ok(lowerCasedParameter);

		return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Social.BannerAllOrUser });
	});
}

interface BannerCache {
	author: string;
	authorName: null;
	id: string;
	group: string;
	price: number;
	title: string;
}
