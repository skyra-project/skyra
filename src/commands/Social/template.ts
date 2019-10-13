import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { CommandStore, KlasaMessage } from 'klasa';
import { join } from 'path';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserSettings } from '../../lib/types/settings/UserSettings';
import { fetch, fetchAvatar, IMAGE_EXTENSION } from '../../lib/util/util';
import { assetsFolder } from '../../Skyra';

const BADGES_FOLDER = join(assetsFolder, 'images', 'social', 'badges');

export default class extends SkyraCommand {

	private profile: Buffer | null = null;
	private panel: Buffer | null = null;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 30,
			description: language => language.get('COMMAND_PROFILE_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_PROFILE_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			usage: '<attachment:attachment>'
		});

		this.createCustomResolver('attachment', async (arg, possible, msg) => {
			if (msg.attachments.size) {
				const attachment = msg.attachments.find(att => IMAGE_EXTENSION.test(att.url));
				if (attachment) return fetch(attachment.url, 'buffer');
			}
			const url = (res => res.protocol && IMAGE_EXTENSION.test(res.pathname) && res.hostname && res.href)(new URL(arg));
			if (url) return fetch(url, 'buffer');
			throw (msg ? msg.language : this.client.languages.default).get('RESOLVER_INVALID_URL', possible.name);
		});
	}

	public async run(message: KlasaMessage, [file]: [Buffer]) {
		const output = await this.showProfile(message, file);
		return message.channel.send({ files: [{ attachment: output, name: 'Profile.png' }] });
	}

	public inhibit(message: KlasaMessage) {
		return !message.guild || message.guild!.id !== '256566731684839428';
	}

	public async showProfile(message: KlasaMessage, file: Buffer) {
		await message.author!.settings.sync();
		const level = message.author!.profileLevel;
		const points = message.author!.settings.get(UserSettings.Points);
		const badgeSet = message.author!.settings.get(UserSettings.BadgeSet);
		const color = message.author!.settings.get(UserSettings.Color);
		const money = message.author!.settings.get(UserSettings.Money);
		const reputation = message.author!.settings.get(UserSettings.Reputation);

		/* Calculate information from the user */
		const previousLevel = Math.floor((level / 0.2) ** 2);
		const nextLevel = Math.floor(((level + 1) / 0.2) ** 2);
		const progressBar = Math.round(((points - previousLevel) / (nextLevel - previousLevel)) * 364);

		/* Global leaderboard */
		const rank = '∞';
		const imgAvatarSRC = await fetchAvatar(message.author!, 256);

		const TITLE = message.language.retrieve('COMMAND_PROFILE') as ProfileTitles;
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
			.addImage(file, 9, 9, 188, 373)
			.restore()
			.addImage(this.profile!, 0, 0, 640, 391)

			// Progress bar
			.setColor(`#${color}`)
			.addRect(227, 356, progressBar, 5)

			// Name title
			.setTextFont('35px RobotoRegular')
			.setColor('rgb(23,23,23')
			.addResponsiveText(message.author!.username, 227, 73, 306)
			.setTextFont('25px RobotoLight')
			.addText(`#${message.author!.discriminator}`, 227, 105)

			// Statistics Titles
			.addText(TITLE.GLOBAL_RANK, 227, 276)
			.addText(TITLE.CREDITS, 227, 229)
			.addText(TITLE.REPUTATION, 227, 181)

			// Experience
			.setTextFont('20px RobotoLight')
			.addText(TITLE.EXPERIENCE, 227, 346)

			// Statistics Values
			.setTextAlign('right')
			.setTextFont('25px RobotoLight')
			.addText(rank, 594, 276)
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
			.setShadowColor('rgba(0,0,0,.7)')
			.setShadowBlur(7)
			.setColor('#FFFFFF')
			.createBeveledPath(10, 10, 620, 371, 8)
			.fill()
			.createBeveledClip(10, 10, 620, 371, 5)
			.clearPixels(10, 10, 186, 371)
			.addCircle(103, 103, 70.5)
			.resetShadows()
			.setColor(`#f2f2f2`)
			.addRect(226, 355, 366, 7)
			.toBufferAsync();

		this.panel = await new Canvas(100, 391)
			.setAntialiasing('subpixel')
			.setShadowColor('rgba(0,0,0,.7)')
			.setShadowBlur(7)
			.setColor('#F2F2F2')
			.createBeveledPath(10, 10, 80, 371, 8)
			.fill()
			.toBufferAsync();
	}

}

interface ProfileTitles {
	GLOBAL_RANK: string;
	CREDITS: string;
	REPUTATION: string;
	EXPERIENCE: string;
	LEVEL: string;
}
