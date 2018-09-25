const { Command, util: { fetchAvatar, fetch }, assetsFolder } = require('../../index');
const { Canvas } = require('canvas-constructor');
const { join } = require('path');
const { readFile } = require('fs-nextra');
const attachmentFilter = /\.(?:webp|png|jpg|gif)$/i;

const BADGES_FOLDER = join(assetsFolder, 'images', 'social', 'badges');

export default class extends Command {

	public constructor(client: Skyra, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['ATTACH_FILES'],
			bucket: 2,
			cooldown: 30,
			description: (language) => language.get('COMMAND_PROFILE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_PROFILE_EXTENDED'),
			runIn: ['text'],
			usage: '<attachment:attachment>'
		});

		this.createCustomResolver('attachment', async(arg, possible, msg) => {
			if (msg.attachments.size) {
				const attachment = msg.attachments.find((att) => attachmentFilter.test(att.url));
				if (attachment) return fetch(attachment.url, 'buffer');
			}
			const url = ((res) => res && res.protocol && attachmentFilter.test(res.pathname) && res.hostname && res.href)(new URL(arg));
			if (url) return fetch(url, 'buffer');
			throw (msg ? msg.language : this.client.languages.default).get('RESOLVER_INVALID_URL', possible.name);
		});

		this.profile = null;
		this.panel = null;
	}

	public async run(msg, [file]) {
		const output = await this.showProfile(msg, file);
		return msg.channel.send({ files: [{ attachment: output, name: 'Profile.png' }] });
	}

	public async inhibit(msg) {
		return !msg.guild || msg.guild.id !== '256566731684839428';
	}

	public async showProfile(msg, file) {
		await msg.author.settings.sync();
		const { points, color, money, reputation, level } = msg.author.settings;

		/* Calculate information from the user */
		const previousLevel = Math.floor((level / 0.2) ** 2);
		const nextLevel = Math.floor(((level + 1) / 0.2) ** 2);
		const progressBar = Math.round(((points - previousLevel) / (nextLevel - previousLevel)) * 364);

		/* Global leaderboard */
		const rank = '∞';
		const imgAvatarSRC = await fetchAvatar(msg.author, 256);

		const TITLE = msg.language.fetch('COMMAND_PROFILE');
		const canvas = new Canvas(msg.author.settings.badgeSet.length ? 700 : 640, 391);
		if (msg.author.settings.badgeSet.length) {
			const badges = await Promise.all(msg.author.settings.badgeSet.map((name) =>
				readFile(join(BADGES_FOLDER, `${name}.png`))
			));

			canvas.addImage(this.panel, 600, 0, 100, 391);
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
			.addImage(this.profile, 0, 0, 640, 391)

			// Progress bar
			.setColor(`#${color}`)
			.addRect(227, 356, progressBar, 5)

			// Name title
			.setTextFont('35px RobotoRegular')
			.setColor('rgb(23,23,23')
			.addResponsiveText(msg.author.username, 227, 73, 306)
			.setTextFont('25px RobotoLight')
			.addText(`#${msg.author.discriminator}`, 227, 105)

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
			.addText(money, 594, 229)
			.addText(reputation, 594, 181)
			.addText(points, 594, 346)

			// Level
			.setTextAlign('center')
			.setTextFont('30px RobotoLight')
			.addText(TITLE.LEVEL, 576, 58)
			.setTextFont('40px RobotoRegular')
			.addText(level, 576, 100)

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
