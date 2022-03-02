import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { Scope } from '#lib/types';
import { cdnFolder } from '#utils/constants';
import { formatNumber } from '#utils/functions';
import { fetchAvatar } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { Canvas, Image, resolveImage, rgba } from 'canvas-constructor/skia';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import type { Message, User } from 'discord.js';
import type { TFunction } from 'i18next';
import { join } from 'node:path';

const THEMES_FOLDER = join(cdnFolder, 'skyra-assets', 'banners');

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['lvl', 'rank'],
	description: LanguageKeys.Commands.Social.LevelDescription,
	detailedDescription: LanguageKeys.Commands.Social.LevelExtended,
	requiredClientPermissions: [PermissionFlagsBits.AttachFiles]
})
export class UserCommand extends SkyraCommand {
	private lightThemeTemplate: Image = null!;
	private darkThemeTemplate: Image = null!;

	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const scope = args.finished ? Scope.Local : await args.pick('scope').catch(() => Scope.Local);
		const user = args.finished ? message.author : await args.pick('userName');

		const output = await this.showProfile(message, scope, user, args.t);
		return send(message, { files: [{ attachment: output, name: 'Level.png' }] });
	}

	public async showProfile(message: Message, scope: Scope, user: User, t: TFunction) {
		const { members, users } = this.container.db;
		const settings = await users.ensureProfile(user.id);
		const { level, points } = scope === Scope.Local && message.guild ? await members.ensure(user.id, message.guild.id) : settings;

		/* Calculate information from the user */
		const previousLevel = Math.floor((level / 0.2) ** 2);
		const nextLevel = Math.floor(((level + 1) / 0.2) ** 2);
		const progressBar = Math.max(Math.round(((points - previousLevel) / (nextLevel - previousLevel)) * 265), 6);

		const [themeImageSRC, imgAvatarSRC] = await Promise.all([
			resolveImage(join(THEMES_FOLDER, `${settings.profile.bannerLevel}.png`)),
			fetchAvatar(user, 256)
		]);

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
				.printText(formatNumber(t, nextLevel - points), 606, 131)

				// Draw the level
				.setTextAlign('center')
				.setTextFont('35px RobotoLight')
				.printText(title.level, 268, 73)
				.setTextFont('45px RobotoRegular')
				.printText(formatNumber(t, level), 268, 128)

				// Draw the avatar
				.save()
				.printCircularImage(imgAvatarSRC, 103, 87, 71)
				.restore()
				.png()
		);
	}

	public async onLoad() {
		[this.lightThemeTemplate, this.darkThemeTemplate] = await Promise.all([
			new Canvas(640, 174)
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
				.png()
				.then(resolveImage),
			new Canvas(640, 174)
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
				.png()
				.then(resolveImage)
		]);
	}
}
