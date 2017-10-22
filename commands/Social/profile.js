const { Command, Canvas } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const { readFile } = require('fs-nextra');
const { join, sep } = require('path');

Canvas
    .registerFont(join(__dirname, '../../assets/fonts/Roboto-Regular.ttf'), 'RobotoRegular')
    .registerFont(join(__dirname, '../../assets/fonts/NotoEmoji.ttf'), 'RobotoRegular')
    .registerFont(join(__dirname, '../../assets/fonts/NotoSans-Regular.ttf'), 'RobotoRegular')
    .registerFont(join(__dirname, '../../assets/fonts/Roboto-Light.ttf'), 'RobotoLight');

const themes = join(__dirname, '../../assets/images/social/themes/') + sep;

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            botPerms: ['ATTACH_FILES'],
            guildOnly: true,
            mode: 1,
            spam: true,
            cooldown: 30,

            usage: '[user:advuser]',
            description: 'Check your user profile.',
            extendedHelp: Command.strip`
                User profiles!

                ⚙ | ***Explained usage***
                Skyra, profile [user]
                User :: (Optional) The user's profile to show. Defaults to the message's author.
            `
        });

        this.profile = null;
    }

    async run(msg, [user = msg.author], settings, i18n) {
        const output = await this.showProfile(user, i18n);
        return msg.channel.send({ files: [{ attachment: output, name: 'Profile.png' }] });
    }

    async showProfile(user, i18n) {
        let profile = user.profile;
        if (profile instanceof Promise) profile = await profile;
        const { points, color, banners, money, reputation } = profile;

        /* Calculate information from the user */
        const currentLevel = Math.floor(0.2 * Math.sqrt(points));
        const previousLevel = Math.floor((currentLevel / 0.2) ** 2);
        const nextLevel = Math.floor(((currentLevel + 1) / 0.2) ** 2);
        const Prog = Math.round(((points - previousLevel) / (nextLevel - previousLevel)) * 364);

        /* Global leaderboard */
        const sortedList = this.client.handler.social.global.sorted();
        const GlobalPosition = sortedList.keyArray().indexOf(user.id) + 1;
        const theme = banners.theme;
        const [themeImageSRC, imgAvatarSRC] = await Promise.all([
            readFile(`${themes}${theme}.png`),
            fetchAvatar(user, 256)
        ]);

        const TITLE = i18n.language.COMMAND_PROFILE;

        return new Canvas(640, 391)
            // Images
            .save()
            .createBeveledClip(10, 10, 620, 371, 8)
            .addImage(themeImageSRC, 9, 9, 188, 373)
            .restore()
            .addImage(this.profile, 0, 0, 640, 391)

            // Progress bar
            .setColor(`#${color}`)
            .addRect(227, 356, Prog, 5)

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
            .addText(TITLE.EXPERIENCE, 227, 346)

            // Statistics Values
            .setTextAlign('right')
            .setTextFont('25px RobotoLight')
            .addText(GlobalPosition, 594, 276)
            .addText(money, 594, 229)
            .addText(reputation, 594, 181)
            .addText(points, 594, 346)

            // Level
            .setTextAlign('center')
            .setTextFont('30px RobotoLight')
            .addText(TITLE.LEVEL, 576, 58)
            .setTextFont('40px RobotoRegular')
            .addText(currentLevel, 576, 100)

            // Avatar
            .addImage(imgAvatarSRC, 32, 32, 142, 142, { type: 'round', radius: 71 })
            .toBufferAsync();
    }

    async init() {
        this.profile = await new Canvas(640, 391)
            .setAntialiasing('subpixel')
            .setShadowColor('rgba(0,0,0,.7)')
            .setShadowBlur(7)
            .setColor('#ffffff')
            .createBeveledPath(10, 10, 620, 371, 8)
            .fill()
            .createBeveledClip(10, 10, 620, 371, 5)
            .clearPixels(10, 10, 186, 371)
            .addCircle(103, 103, 70.5)
            .resetShadows()
            .setColor(`#f2f2f2`)
            .addRect(226, 355, 366, 7)
            .toBufferAsync();
    }

};
