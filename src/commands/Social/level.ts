import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { join } from 'path';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserSettings } from '../../lib/types/settings/UserSettings';
import { fetchAvatar } from '../../lib/util/util';
import { cdnFolder } from '../../Skyra';

const THEMES_FOLDER = join(cdnFolder, 'img', 'banners');

export default class extends SkyraCommand {

	private template: Buffer | null = null;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['lvl', 'rank'],
			bucket: 2,
			cooldown: 30,
			description: language => language.get('COMMAND_LEVEL_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_LEVEL_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			spam: true,
			usage: '[user:username]'
		});
	}

	public async run(message: KlasaMessage, [user = message.author!]: [KlasaUser]) {
		const output = await this.showProfile(message, user);
		return message.channel.send({ files: [{ attachment: output, name: 'Level.png' }] });
	}

	public async showProfile(message: KlasaMessage, user: KlasaUser) {
		await user.settings.sync();
		const points = user.settings.get(UserSettings.Points);
		const color = user.settings.get(UserSettings.Color);
		const themeLevel = user.settings.get(UserSettings.ThemeLevel);
		const level = user.profileLevel;

		/* Calculate information from the user */
		const previousLevel = Math.floor((level / 0.2) ** 2);
		const nextLevel = Math.floor(((level + 1) / 0.2) ** 2);
		const progressBar = Math.round(((points - previousLevel) / (nextLevel - previousLevel)) * 265);

		const [themeImageSRC, imgAvatarSRC] = await Promise.all([
			readFile(join(THEMES_FOLDER, `${themeLevel}.png`)),
			fetchAvatar(user, 256)
		]);

		const TITLE = message.language.retrieve('COMMAND_LEVEL') as LevelTitles;
		return new Canvas(640, 174)
			// Draw the background
			.save()
			.createBeveledClip(10, 10, 620, 154, 8)
			.addImage(themeImageSRC, 9, 9, 189, 157)
			.restore()
			.addImage(this.template!, 0, 0, 640, 174)

			// Set styles
			.setColor('rgb(23,23,23)')
			.setTextFont('28px RobotoLight')

			// Statistics Titles
			.addText(TITLE.EXPERIENCE, 340, 73)
			.addText(TITLE.NEXT_IN, 340, 131)

			// Draw the progress bar
			.setColor(`#${color || 'FF239D'}`)
			.addRect(341, 88, progressBar, 5)

			// Draw the information
			.setColor('rgb(23,23,23)')
			.setTextAlign('right')
			.addText(points.toString(), 606, 73)
			.addText((nextLevel - points).toString(), 606, 131)

			// Draw the level
			.setTextAlign('center')
			.setTextFont('35px RobotoLight')
			.addText(TITLE.LEVEL, 268, 73)
			.setTextFont('45px RobotoRegular')
			.addText(level.toString(), 273, 128)

			// Draw the avatar
			.save()
			.addImage(imgAvatarSRC, 32, 16, 142, 142, { type: 'round', radius: 71 })
			.restore()
			.toBufferAsync();
	}

	public async init() {
		this.template = await new Canvas(640, 174)
			.setAntialiasing('subpixel')
			.setShadowColor('rgba(0,0,0,.7)')
			.setShadowBlur(7)
			.setColor('#ffffff')
			.createBeveledPath(10, 10, 620, 154, 8)
			.fill()
			.createBeveledClip(10, 10, 620, 154, 5)
			.clearPixels(10, 10, 186, 154)
			.addCircle(103, 87, 70)
			.resetShadows()
			.setColor(`#f2f2f2`)
			.addRect(340, 87, 267, 7)
			.toBufferAsync();
	}

}

interface LevelTitles {
	EXPERIENCE: string;
	NEXT_IN: string;
	LEVEL: string;
}
