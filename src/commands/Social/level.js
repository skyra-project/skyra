const { Command, util: { fetchAvatar } } = require('../../index');
const { Canvas } = require('canvas-constructor');
const { join } = require('path');
const { readFile } = require('fs-nextra');

const THEMES_FOLDER = join('/var', 'www', 'assets', 'img', 'banners');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['lvl'],
			requiredPermissions: ['ATTACH_FILES'],
			bucket: 2,
			cooldown: 30,
			description: (language) => language.get('COMMAND_LEVEL_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_LEVEL_EXTENDED'),
			runIn: ['text'],
			usage: '[user:username]'
		});

		this.spam = true;
		this.template = null;
	}

	async run(msg, [user = msg.author]) {
		const output = await this.showProfile(msg, user);
		return msg.channel.send({ files: [{ attachment: output, name: 'Level.png' }] });
	}

	async showProfile(msg, user) {
		await user.settings.waitSync();
		const { points, color, themeLevel, level } = user.settings;

		/* Calculate information from the user */
		const previousLevel = Math.floor((level / 0.2) ** 2);
		const nextLevel = Math.floor(((level + 1) / 0.2) ** 2);
		const progressBar = Math.round(((points - previousLevel) / (nextLevel - previousLevel)) * 265);

		const [themeImageSRC, imgAvatarSRC] = await Promise.all([
			readFile(join(THEMES_FOLDER, `${themeLevel}.png`)),
			fetchAvatar(user, 256)
		]);

		const TITLE = msg.language.fetch('COMMAND_LEVEL');
		return new Canvas(640, 174)
			// Draw the background
			.save()
			.createBeveledClip(10, 10, 620, 154, 8)
			.addImage(themeImageSRC, 9, 9, 189, 157)
			.restore()
			.addImage(this.template, 0, 0, 640, 174)

			// Set styles
			.setColor('rgb(23,23,23)')
			.setTextFont('28px RobotoLight')

			// Statistics Titles
			.addText(TITLE.EXPERIENCE, 340, 73)
			.addText(TITLE.NEXT_IN, 340, 131)

			// Draw the progress bar
			.setColor(`#${color}`)
			.addRect(341, 88, progressBar, 5)

			// Draw the information
			.setColor('rgb(23,23,23)')
			.setTextAlign('right')
			.addText(points, 606, 73)
			.addText((nextLevel - points).toString(), 606, 131)

			// Draw the level
			.setTextAlign('center')
			.setTextFont('35px RobotoLight')
			.addText(TITLE.LEVEL, 268, 73)
			.setTextFont('45px RobotoRegular')
			.addText(level, 273, 128)

			// Draw the avatar
			.save()
			.addImage(imgAvatarSRC, 32, 16, 142, 142, { type: 'round', radius: 71 })
			.restore()
			.toBufferAsync();
	}

	async init() {
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

};
