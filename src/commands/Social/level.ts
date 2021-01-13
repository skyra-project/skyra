import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { cdnFolder } from '#utils/constants';
import { fetchAvatar } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { Image, loadImage } from 'canvas';
import { Canvas, rgba } from 'canvas-constructor';
import { Message, User } from 'discord.js';
import { join } from 'path';

const THEMES_FOLDER = join(cdnFolder, 'skyra-assets', 'banners');

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['lvl', 'rank'],
	bucket: 2,
	cooldown: 30,
	description: LanguageKeys.Commands.Social.LevelDescription,
	extendedHelp: LanguageKeys.Commands.Social.LevelExtended,
	requiredPermissions: ['ATTACH_FILES'],
	spam: true,
	usage: '[local|global] [user:username]',
	usageDelim: ' '
})
export default class extends SkyraCommand {
	private lightThemeTemplate: Image = null!;
	private darkThemeTemplate: Image = null!;

	public async run(message: Message, [scope = 'local', user = message.author]: ['local' | 'global', User]) {
		const output = await this.showProfile(message, scope, user);
		return message.channel.send({ files: [{ attachment: output, name: 'Level.png' }] });
	}

	public async showProfile(message: Message, scope: 'local' | 'global', user: User) {
		const { members, users } = await DbSet.connect();
		const settings = await users.ensureProfile(user.id);
		const { level, points } = scope === 'local' && message.guild ? await members.ensure(user.id, message.guild.id) : settings;

		/* Calculate information from the user */
		const previousLevel = Math.floor((level / 0.2) ** 2);
		const nextLevel = Math.floor(((level + 1) / 0.2) ** 2);
		const progressBar = Math.max(Math.round(((points - previousLevel) / (nextLevel - previousLevel)) * 265), 6);

		const [themeImageSRC, imgAvatarSRC] = await Promise.all([
			loadImage(join(THEMES_FOLDER, `${settings.profile.bannerLevel}.png`)),
			fetchAvatar(user, 256)
		]);

		const t = await message.fetchT();
		const title = t(LanguageKeys.Commands.Social.Level);
		return (
			new Canvas(640, 174)
				// Draw the background
				.save()
				.createRoundedClip(10, 10, 620, 154, 8)
				.printImage(themeImageSRC, 9, 9, 189, 157)
				.restore()
				.printImage(settings.profile.darkTheme ? this.darkThemeTemplate : this.lightThemeTemplate, 0, 0, 640, 174)

				// Draw the progress bar
				.setColor(`#${settings.profile.color.toString(16).padStart(6, '0') || 'FF239D'}`)
				.printRoundedRectangle(341, 86, progressBar, 9, 3)

				// Set styles
				.setColor(settings.profile.darkTheme ? '#F0F0F0' : '#171717')
				.setTextFont('28px RobotoLight')

				// Statistics Titles
				.printText(title.experience, 340, 73)
				.printText(title.nextIn, 340, 128)

				// Draw the information
				.setTextAlign('right')
				.printText(t(LanguageKeys.Globals.NumberCompactValue, { value: points }), 606, 73)
				.printText(t(LanguageKeys.Globals.NumberValue, { value: nextLevel - points }), 606, 131)

				// Draw the level
				.setTextAlign('center')
				.setTextFont('35px RobotoLight')
				.printText(title.level, 268, 73)
				.setTextFont('45px RobotoRegular')
				.printText(t(LanguageKeys.Globals.NumberValue, { value: level }), 268, 128)

				// Draw the avatar
				.save()
				.printCircularImage(imgAvatarSRC, 103, 87, 71)
				.restore()
				.toBufferAsync()
		);
	}

	public async init() {
		[this.lightThemeTemplate, this.darkThemeTemplate] = await Promise.all([
			new Canvas(640, 174)
				.setAntialiasing('subpixel')
				.setShadowColor(rgba(0, 0, 0, 0.7))
				.setShadowBlur(7)
				.setColor('#FFFFFF')
				.createRoundedPath(10, 10, 620, 154, 8)
				.fill()
				.createRoundedClip(10, 10, 620, 154, 5)
				.clearRectangle(10, 10, 186, 154)
				.printCircle(103, 87, 70)
				.resetShadows()
				.setColor('#E8E8E8')
				.printRoundedRectangle(340, 85, 267, 11, 4)
				.toBufferAsync()
				.then(loadImage),
			new Canvas(640, 174)
				.setAntialiasing('subpixel')
				.setShadowColor(rgba(0, 0, 0, 0.7))
				.setShadowBlur(7)
				.setColor('#202225')
				.createRoundedPath(10, 10, 620, 154, 8)
				.fill()
				.createRoundedClip(10, 10, 620, 154, 5)
				.clearRectangle(10, 10, 186, 154)
				.printCircle(103, 87, 70)
				.resetShadows()
				.setColor('#2C2F33')
				.printRoundedRectangle(340, 85, 267, 11, 4)
				.toBufferAsync()
				.then(loadImage)
		]);
	}
}
