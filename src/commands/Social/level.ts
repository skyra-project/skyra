import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { join } from 'path';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserSettings } from '../../lib/types/settings/UserSettings';
import { fetchAvatar } from '../../lib/util/util';
import { cdnFolder } from '../../lib/util/constants';

const THEMES_FOLDER = join(cdnFolder, 'img', 'banners');

export default class extends SkyraCommand {

	private lightThemeTemplate: Buffer | null = null;
	private darkThemeTemplate: Buffer | null = null;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['lvl', 'rank'],
			bucket: 2,
			cooldown: 30,
			description: language => language.tget('COMMAND_LEVEL_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_LEVEL_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			spam: true,
			usage: '[user:username]'
		});
	}

	public async run(message: KlasaMessage, [user = message.author]: [KlasaUser]) {
		const output = await this.showProfile(message, user);
		return message.channel.send({ files: [{ attachment: output, name: 'Level.png' }] });
	}

	public async showProfile(message: KlasaMessage, user: KlasaUser) {
		await user.settings.sync();
		const points = user.settings.get(UserSettings.Points);
		const color = user.settings.get(UserSettings.Color);
		const themeLevel = user.settings.get(UserSettings.ThemeLevel);
		const level = user.profileLevel;
		const darkTheme = user.settings.get(UserSettings.DarkTheme);

		/* Calculate information from the user */
		const previousLevel = Math.floor((level / 0.2) ** 2);
		const nextLevel = Math.floor(((level + 1) / 0.2) ** 2);
		const progressBar = Math.max(Math.round(((points - previousLevel) / (nextLevel - previousLevel)) * 265), 6);

		const [themeImageSRC, imgAvatarSRC] = await Promise.all([
			readFile(join(THEMES_FOLDER, `${themeLevel}.png`)),
			fetchAvatar(user, 256)
		]);

		const TITLE = message.language.retrieve('COMMAND_LEVEL');
		return new Canvas(640, 174)
			// Draw the background
			.save()
			.createBeveledClip(10, 10, 620, 154, 8)
			.addImage(themeImageSRC, 9, 9, 189, 157)
			.restore()
			.addImage(darkTheme ? this.darkThemeTemplate! : this.lightThemeTemplate!, 0, 0, 640, 174)

			// Draw the progress bar
			.setColor(`#${color.toString(16).padStart(6, '0') || 'FF239D'}`)
			.addBeveledRect(341, 86, progressBar, 9, 3)

			// Set styles
			.setColor(darkTheme ? '#F0F0F0' : '#171717')
			.setTextFont('28px RobotoLight')

			// Statistics Titles
			.addText(TITLE.EXPERIENCE, 340, 73)
			.addText(TITLE.NEXT_IN, 340, 128)

			// Draw the information
			.setTextAlign('right')
			.addText(points.toString(), 606, 73)
			.addText((nextLevel - points).toString(), 606, 131)

			// Draw the level
			.setTextAlign('center')
			.setTextFont('35px RobotoLight')
			.addText(TITLE.LEVEL, 268, 73)
			.setTextFont('45px RobotoRegular')
			.addText(level.toString(), 268, 128)

			// Draw the avatar
			.save()
			.addImage(imgAvatarSRC, 32, 16, 142, 142, { type: 'round', radius: 71 })
			.restore()
			.toBufferAsync();
	}

	public async init() {
		[
			this.lightThemeTemplate,
			this.darkThemeTemplate
		] = await Promise.all([
			new Canvas(640, 174)
				.setAntialiasing('subpixel')
				.setShadowColor('rgba(0,0,0,.7)')
				.setShadowBlur(7)
				.setColor('#FFFFFF')
				.createBeveledPath(10, 10, 620, 154, 8)
				.fill()
				.createBeveledClip(10, 10, 620, 154, 5)
				.clearPixels(10, 10, 186, 154)
				.addCircle(103, 87, 70)
				.resetShadows()
				.setColor(`#E8E8E8`)
				.addBeveledRect(340, 85, 267, 11, 4)
				.toBufferAsync(),
			new Canvas(640, 174)
				.setAntialiasing('subpixel')
				.setShadowColor('rgba(0,0,0,.7)')
				.setShadowBlur(7)
				.setColor('#202225')
				.createBeveledPath(10, 10, 620, 154, 8)
				.fill()
				.createBeveledClip(10, 10, 620, 154, 5)
				.clearPixels(10, 10, 186, 154)
				.addCircle(103, 87, 70)
				.resetShadows()
				.setColor(`#2C2F33`)
				.addBeveledRect(340, 85, 267, 11, 4)
				.toBufferAsync()
		]);
	}

}

export interface LevelTitles {
	EXPERIENCE: string;
	NEXT_IN: string;
	LEVEL: string;
}
