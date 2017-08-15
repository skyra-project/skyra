const { Command } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const { readFile } = require('fs-nextra');
const { join, sep } = require('path');
const Canvas = require('../../utils/canvas-constructor');

Canvas
    .registerFont(join(__dirname, '../../assets/fonts/Roboto-Regular.ttf'), { family: 'RobotoRegular' })
    .registerFont(join(__dirname, '../../assets/fonts/Roboto-Light.ttf'), { family: 'RobotoLight' });

const profileTemplate = join(__dirname, '../../assets/images/social/level-foreground.png');
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

                = Usage =
                Skyra, level [user]
                User :: (Optional) The user's profile to show. Defaults to the message's author.
            `
        });
    }

    async run(msg, [user = msg.author]) {
        const output = await this.showProfile(user);
        return msg.channel.send({ files: [{ attachment: output, name: 'Profile.png' }] });
    }

    async showProfile(user) {
        const { points, color, banners } = user.profile;

        /* Calculate information from the user */
        const currentLevel = Math.floor(0.2 * Math.sqrt(points));
        const previousLevel = Math.floor((currentLevel / 0.2) ** 2);
        const nextLevel = Math.floor(((currentLevel + 1) / 0.2) ** 2);
        const Prog = Math.round(((points - previousLevel) / (nextLevel - previousLevel)) * 265);

        const theme = banners.level;
        const [themeImageSRC, backgroundSRC, imgAvatarSRC] = await Promise.all([
            readFile(`${themes}${theme}.png`),
            readFile(profileTemplate),
            fetchAvatar(user, 256)
        ]);

        return new Canvas(640, 174)
            // Draw the background
            .addImage(themeImageSRC)
            .addImage(backgroundSRC)

            // Draw the progress bar
            .setColor(`#${color}`)
            .addRect(341, 88, Prog, 5)

            // Draw the information
            .setColor('rgb(23,23,23)')
            .setTextFont('28px RobotoLight')
            .setTextAlign('right')
            .addText(points, 606, 68)
            .addText(nextLevel - points, 606, 128)

            // Draw the level
            .setTextAlign('center')
            .setTextFont('45px RobotoRegular')
            .addText(currentLevel, 273, 128)

            // Draw the avatar
            .addImage(imgAvatarSRC, 34, 18, 139, 139, { type: 'Round', radius: 69.5 })
            .toBuffer();
    }

};
