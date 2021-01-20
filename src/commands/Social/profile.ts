import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { cdnFolder } from '#utils/constants';
import { fetchAvatar } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import type { Message, User } from 'discord.js';
import { join } from 'path';

// Skyra's CDN assets folder
const THEMES_FOLDER = join(cdnFolder, 'skyra-assets', 'banners');
const BADGES_FOLDER = join(cdnFolder, 'skyra-assets', 'badges');

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 30,
	description: LanguageKeys.Commands.Social.ProfileDescription,
	extendedHelp: LanguageKeys.Commands.Social.ProfileExtended,
	requiredPermissions: ['ATTACH_FILES'],
	spam: true,
	usage: '[local|global] [user:username]',
	usageDelim: ' '
})
export default class extends SkyraCommand {
	private lightThemeTemplate: Image = null!;
	private darkThemeTemplate: Image = null!;
	private lightThemeDock: Image = null!;
	private darkThemeDock: Image = null!;

	public async run(message: Message, [scope = 'global', user = message.author]: ['local' | 'global', User]) {
		const output = await this.showProfile(message, scope, user);
		return message.channel.send({ files: [{ attachment: output, name: 'Profile.png' }] });
	}

	public async showProfile(message: Message, scope: 'local' | 'global', user: User) {
		const { members, users } = await DbSet.connect();
		const settings = await users.ensureProfile(user.id);
		const { level, points } = scope === 'local' && message.guild ? await members.ensure(user.id, message.guild.id) : settings;

		/* Calculate information from the user */
		const previousLevel = Math.floor((level / 0.2) ** 2);
		const nextLevel = Math.floor(((level + 1) / 0.2) ** 2);
		const progressBar = Math.max(Math.round(((points - previousLevel) / (nextLevel - previousLevel)) * 364), 6);

		/* Global leaderboard */
		const rank = await user.fetchRank();
		const [themeImageSRC, imgAvatarSRC] = await Promise.all([
			loadImage(join(THEMES_FOLDER, `${settings.profile.bannerProfile}.png`)),
			fetchAvatar(user, 256)
		]);

		const t = await message.fetchT();
		const title = t(LanguageKeys.Commands.Social.Profile);
		const canvas = new Canvas(settings.profile.publicBadges.length ? 700 : 640, 391);
		if (settings.profile.publicBadges.length) {
			const badges = await Promise.all(settings.profile.publicBadges.map((name) => loadImage(join(BADGES_FOLDER, `${name}.png`))));

			canvas.printImage(settings.profile.darkTheme ? this.darkThemeDock : this.lightThemeDock, 600, 0, 100, 391);
			let position = 20;
			for (const badge of badges) {
				canvas.printImage(badge, 635, position, 50, 50);
				position += 74;
			}
		}

		return (
			canvas
				// Images
				.save()
				.createRoundedClip(10, 10, 620, 371, 8)
				.printImage(themeImageSRC, 9, 9, 188, 373)
				.restore()
				.printImage(settings.profile.darkTheme ? this.darkThemeTemplate : this.lightThemeTemplate, 0, 0, 640, 391)

				// Progress bar
				.setColor(`#${settings.profile.color.toString(16).padStart(6, '0') || 'FF239D'}`)
				.printRoundedRectangle(227, 352, progressBar, 9, 3)

				// Name title
				.setTextFont('35px RobotoRegular')
				.setColor(settings.profile.darkTheme ? '#F0F0F0' : '#171717')
				.printResponsiveText(user.username, 227, 73, 306)
				.setTextFont('25px RobotoLight')
				.printText(`#${user.discriminator}`, 227, 105)

				// Statistics Titles
				.printText(title.globalRank, 227, 276)
				.printText(title.credits, 227, 229)
				.printText(title.reputation, 227, 181)

				// Experience
				.setTextFont('20px RobotoLight')
				.printText(title.experience, 227, 342)

				// Statistics Values
				.setTextAlign('right')
				.setTextFont('25px RobotoLight')
				.printText(rank.toString(), 594, 276)
				.printText(t(LanguageKeys.Commands.Social.ProfileMoney, { money: settings.money, vault: settings.profile.vault }), 594, 229)
				.printText(t(LanguageKeys.Globals.NumberCompactValue, { value: settings.reputations }), 594, 181)
				.printText(t(LanguageKeys.Globals.NumberValue, { value: points }), 594, 346)

				// Level
				.setTextAlign('center')
				.setTextFont('30px RobotoLight')
				.printText(title.level, 576, 58)
				.setTextFont('40px RobotoRegular')
				.printText(t(LanguageKeys.Globals.NumberValue, { value: level }), 576, 100)

				// Avatar
				.printCircularImage(imgAvatarSRC, 103, 103, 71)
				.toBufferAsync()
		);
	}

	public async onLoad() {
		[this.lightThemeTemplate, this.darkThemeTemplate, this.lightThemeDock, this.darkThemeDock] = await Promise.all([
			new Canvas(640, 391)
				.setAntialiasing('subpixel')
				.setShadowColor('rgba(0, 0, 0, 0.7)')
				.setShadowBlur(7)
				.setColor('#FFFFFF')
				.createRoundedPath(10, 10, 620, 371, 8)
				.fill()
				.createRoundedClip(10, 10, 620, 371, 5)
				.clearRectangle(10, 10, 186, 371)
				.printCircle(103, 103, 70.5)
				.resetShadows()
				.setColor('#E8E8E8')
				.printRoundedRectangle(226, 351, 366, 11, 4)
				.toBufferAsync()
				.then(loadImage),
			new Canvas(640, 391)
				.setAntialiasing('subpixel')
				.setShadowColor('rgba(0, 0, 0, 0.7)')
				.setShadowBlur(7)
				.setColor('#202225')
				.createRoundedPath(10, 10, 620, 371, 8)
				.fill()
				.createRoundedClip(10, 10, 620, 371, 5)
				.clearRectangle(10, 10, 186, 371)
				.printCircle(103, 103, 70.5)
				.resetShadows()
				.setColor('#2C2F33')
				.printRoundedRectangle(226, 351, 366, 11, 4)
				.toBufferAsync()
				.then(loadImage),
			new Canvas(100, 391)
				.setAntialiasing('subpixel')
				.setShadowColor('rgba(0, 0, 0, 0.7)')
				.setShadowBlur(7)
				.setColor('#E8E8E8')
				.createRoundedPath(10, 10, 80, 371, 8)
				.fill()
				.toBufferAsync()
				.then(loadImage),
			new Canvas(100, 391)
				.setAntialiasing('subpixel')
				.setShadowColor('rgba(0, 0, 0, 0.7)')
				.setShadowBlur(7)
				.setColor('#272A2E')
				.createRoundedPath(10, 10, 80, 371, 8)
				.fill()
				.toBufferAsync()
				.then(loadImage)
		]);
	}
}
