import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { join } from 'path';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserSettings } from '../../lib/types/settings/UserSettings';
import { fetchAvatar } from '../../lib/util/util';
import { cdnFolder } from '../../lib/util/constants';

// Skyra's CDN assets folder
const THEMES_FOLDER = join(cdnFolder, 'img', 'banners');
const BADGES_FOLDER = join(cdnFolder, 'img', 'badges');

export default class extends SkyraCommand {

	private profile: Buffer | null = null;
	private panel: Buffer | null = null;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 30,
			description: language => language.tget('COMMAND_PROFILE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_PROFILE_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			spam: true,
			usage: '[user:username]'
		});
	}

	public async run(message: KlasaMessage, [user = message.author]: [KlasaUser]) {
		const output = await this.showProfile(message, user);
		return message.channel.send({ files: [{ attachment: output, name: 'Profile.png' }] });
	}

	public async showProfile(message: KlasaMessage, user: KlasaUser) {
		await user.settings.sync();
		const level = user.profileLevel;
		const points = user.settings.get(UserSettings.Points);
		const themeProfile = user.settings.get(UserSettings.ThemeProfile);
		const badgeSet = user.settings.get(UserSettings.BadgeSet);
		const color = user.settings.get(UserSettings.Color);
		const money = user.settings.get(UserSettings.Money);
		const reputation = user.settings.get(UserSettings.Reputation);

		/* Calculate information from the user */
		const previousLevel = Math.floor((level / 0.2) ** 2);
		const nextLevel = Math.floor(((level + 1) / 0.2) ** 2);
		const progressBar = Math.max(Math.round(((points - previousLevel) / (nextLevel - previousLevel)) * 364), 6);

		/* Global leaderboard */
		const rank = await user.fetchRank();
		const [themeImageSRC, imgAvatarSRC] = await Promise.all([
			readFile(join(THEMES_FOLDER, `${themeProfile}.png`)),
			fetchAvatar(user, 256)
		]);

		const TITLE = message.language.retrieve('COMMAND_PROFILE');
		const canvas = new Canvas(badgeSet.length ? 700 : 640, 391);
		if (badgeSet.length) {
			const badges = await Promise.all(badgeSet.map(name =>
				readFile(join(BADGES_FOLDER, `${name}.png`))));

			canvas.addImage(this.panel!, 600, 0, 100, 391);
			let position = 20;
			for (const badge of badges) {
				canvas.addImage(badge, 635, position, 50, 50);
				position += 74;
			}
		}

		return canvas
			// Images
			.save()
			.createBeveledClip(10, 10, 620, 371, 8)
			.addImage(themeImageSRC, 9, 9, 188, 373)
			.restore()
			.addImage(this.profile!, 0, 0, 640, 391)

			// Progress bar
			.setColor(`#${color.toString(16).padStart(6, '0') || 'FF239D'}`)
			.addBeveledRect(227, 352, progressBar, 9, 3)

			// Name title
			.setTextFont('35px RobotoRegular')
			.setColor('rgb(23,23,23')
			.addResponsiveText(user.username, 227, 73, 306)
			.setTextFont('25px RobotoLight')
			.addText(`#${user.discriminator}`, 227, 105)

			// Statistics Titles
			.addText(TITLE.GLOBAL_RANK, 227, 276)
			.addText(TITLE.CREDITS, 227, 229)
			.addText(TITLE.REPUTATION, 227, 181)

			// Experience
			.setTextFont('20px RobotoLight')
			.addText(TITLE.EXPERIENCE, 227, 342)

			// Statistics Values
			.setTextAlign('right')
			.setTextFont('25px RobotoLight')
			.addText(rank.toString(), 594, 276)
			.addText(money.toString(), 594, 229)
			.addText(reputation.toString(), 594, 181)
			.addText(points.toString(), 594, 346)

			// Level
			.setTextAlign('center')
			.setTextFont('30px RobotoLight')
			.addText(TITLE.LEVEL, 576, 58)
			.setTextFont('40px RobotoRegular')
			.addText(level.toString(), 576, 100)

			// Avatar
			.addImage(imgAvatarSRC, 32, 32, 142, 142, { type: 'round', radius: 71 })
			.toBufferAsync();
	}

	public async init() {
		this.profile = await new Canvas(640, 391)
			.setAntialiasing('subpixel')
			.setShadowColor('rgba(0, 0, 0, 0.7)')
			.setShadowBlur(7)
			.setColor('#FFFFFF')
			.createBeveledPath(10, 10, 620, 371, 8)
			.fill()
			.createBeveledClip(10, 10, 620, 371, 5)
			.clearPixels(10, 10, 186, 371)
			.addCircle(103, 103, 70.5)
			.resetShadows()
			.setColor(`#E8E8E8`)
			.addBeveledRect(226, 351, 366, 11, 4)
			.toBufferAsync();

		this.panel = await new Canvas(100, 391)
			.setAntialiasing('subpixel')
			.setShadowColor('rgba(0, 0, 0, 0.7)')
			.setShadowBlur(7)
			.setColor('#E8E8E8')
			.createBeveledPath(10, 10, 80, 371, 8)
			.fill()
			.toBufferAsync();
	}

}

export interface ProfileTitles {
	GLOBAL_RANK: string;
	CREDITS: string;
	REPUTATION: string;
	EXPERIENCE: string;
	LEVEL: string;
}
