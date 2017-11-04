const { Command, Canvas } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const { readFile } = require('fs-nextra');
const { join, sep } = require('path');

Canvas
	.registerFont(join(__dirname, '../../assets/fonts/Roboto-Regular.ttf'), 'RobotoRegular')
	.registerFont(join(__dirname, '../../assets/fonts/Roboto-Light.ttf'), 'RobotoLight');

const themes = join(__dirname, '../../assets/images/social/themes/') + sep;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['lvl'],
			botPerms: ['ATTACH_FILES'],
			guildOnly: true,
			mode: 1,
			spam: true,
			cooldown: 30,

			usage: '[user:advuser]',
			description: 'Check your global level.',
			extendedHelp: Command.strip`
                How much until I reach next level?

                ⚙ | ***Explained usage***
                Skyra, level [user]
                User :: (Optional) The user's profile to show. Defaults to the message's author.
            `
		});

		this.template = null;
	}

	async run(msg, [user = msg.author], settings, i18n) {
		const output = await this.showProfile(user, i18n);
		return msg.channel.send({ files: [{ attachment: output, name: 'Profile.png' }] });
	}

	async showProfile(user, i18n) {
		const { points, color, banners } = user.profile;

		/* Calculate information from the user */
		const currentLevel = Math.floor(0.2 * Math.sqrt(points));
		const previousLevel = Math.floor((currentLevel / 0.2) ** 2);
		const nextLevel = Math.floor(((currentLevel + 1) / 0.2) ** 2);
		const Prog = Math.round(((points - previousLevel) / (nextLevel - previousLevel)) * 265);

		const theme = banners.level;
		const [themeImageSRC, imgAvatarSRC] = await Promise.all([
			readFile(`${themes}${theme}.png`),
			fetchAvatar(user, 256)
		]);

		const TITLE = i18n.language.COMMAND_LEVEL
												|| this.client.languages.get('en-US').language.COMMAND_LEVEL;

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
			.addRect(341, 88, Prog, 5)

		// Draw the information
			.setColor('rgb(23,23,23)')
			.setTextAlign('right')
			.addText(points, 606, 73)
			.addText(nextLevel - points, 606, 131)

		// Draw the level
			.setTextAlign('center')
			.setTextFont('35px RobotoLight')
			.addText(TITLE.LEVEL, 268, 73)
			.setTextFont('45px RobotoRegular')
			.addText(currentLevel, 273, 128)

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
