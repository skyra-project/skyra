const { Command } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const { readFile } = require('fs-nextra');
const { join, sep } = require('path');
const Canvas = require('../../utils/canvas-constructor');

Canvas
    .registerFont(join(__dirname, '../../assets/fonts/Roboto-Regular.ttf'), 'RobotoRegular')
    .registerFont(join(__dirname, '../../assets/fonts/NotoEmoji.ttf'), 'RobotoRegular')
    .registerFont(join(__dirname, '../../assets/fonts/NotoSans-Regular.ttf'), 'RobotoRegular')
    .registerFont(join(__dirname, '../../assets/fonts/Roboto-Light.ttf'), 'RobotoLight');

const profileTemplate = join(__dirname, '../../assets/images/social/profile-foreground.png');
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

                = Usage =
                Skyra, profile [user]
                User :: (Optional) The user's profile to show. Defaults to the message's author.
            `
        });
    }

    async run(msg, [user = msg.author]) {
        const output = await this.showProfile(user);
        return msg.channel.send({ files: [{ attachment: output, name: 'Profile.png' }] });
    }

    async showProfile(user) {
        let profile = user.profile;
        if (profile instanceof Promise) profile = await profile;
        const { points, color, banners, money, reputation } = profile;

        /* Calculate information from the user */
        const currentLevel = Math.floor(0.2 * Math.sqrt(points));
        const previousLevel = Math.floor((currentLevel / 0.2) ** 2);
        const nextLevel = Math.floor(((currentLevel + 1) / 0.2) ** 2);
        const Prog = Math.round(((points - previousLevel) / (nextLevel - previousLevel)) * 356);

        /* Global leaderboard */
        const sortedList = this.client.handler.social.global.sorted();
        const GlobalPosition = sortedList.keyArray().indexOf(user.id) + 1;
        const theme = banners.theme;
        const [themeImageSRC, backgroundSRC, imgAvatarSRC] = await Promise.all([
            readFile(`${themes}${theme}.png`),
            readFile(profileTemplate),
            fetchAvatar(user, 256)
        ]);

        return new Canvas(640, 391)
            .addImage(themeImageSRC, 9, 9, 188, 373)
            .addImage(backgroundSRC, 0, 0, 640, 391)
            .setColor(`#${color}`)
            .addRect(235, 356, Prog, 5)
            .setTextFont('35px RobotoRegular')
            .setColor('rgb(23,23,23')
            .addResponsiveText(user.username, 227, 73, 306)
            .setTextFont('25px RobotoLight')
            .addText(`#${user.discriminator}`, 227, 105)
            .setTextAlign('right')
            .addText(GlobalPosition, 594, 276)
            .addText(money, 594, 229)
            .addText(reputation, 594, 181)
            .addText(points, 594, 346)
            .setTextAlign('center')
            .setTextFont('40px RobotoRegular')
            .addText(currentLevel, 576, 100)
            .addImage(imgAvatarSRC, 32, 31, 141, 141, { type: 'round', radius: 70.5 })
            .toBufferAsync();
    }

};
