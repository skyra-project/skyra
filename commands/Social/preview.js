const Command = require("../../classes/command");

const { fetchAll: fetchGlobal } = require("../../utils/managerSocialGlobal");
const { fetchAvatar } = require("../../functions/wrappers");
const { readFile } = require("fs-nextra");
const { join } = require("path");
const snekfetch = require("snekfetch");
const Canvas = require("canvas");

Canvas.registerFont(join(__dirname, "../../assets/fonts/Roboto-Regular.ttf"), { family: "RobotoRegular" });
Canvas.registerFont(join(__dirname, "../../assets/fonts/Roboto-Light.ttf"), { family: "RobotoLight" });

const profileTemplate = join(__dirname, "../../assets/images/social/profile-foreground.png");

module.exports = class PreviewProfile extends Command {

    constructor(...args) {
        super(...args, "preview", {
            botPerms: ["ATTACH_FILES"],
            guildOnly: true,
            mode: 1,
            spam: false,

            guilds: ["256566731684839428"],

            usage: "[url:url]",
            description: "Preview a user profile's banner.",
        });
    }

    async run(msg, [input]) {
        let url;
        if (msg.attachments.size > 0) url = msg.attachments.first().url;
        if (input && /\.(webm|png|jpg)$/.test(input)) url = input;
        if (!url) throw "You must attach an image or a valid image URL.";
        const output = await this.showProfile(msg.author, url);
        return msg.channel.send({ files: [{ attachment: output, name: "Profile.png" }] });
    }

    async showProfile(user, url) {
        const { points, color, exists, money, reputation } = user.profile;

        /* Calculate information from the user */
        const currentLevel = Math.floor(0.2 * Math.sqrt(points));
        const previousLevel = Math.floor((currentLevel / 0.2) ** 2);
        const nextLevel = Math.floor(((currentLevel + 1) / 0.2) ** 2);
        const Prog = Math.round(((points - previousLevel) / (nextLevel - previousLevel)) * 356);

        /* Global leaderboard */
        const sortedList = fetchGlobal().sort((a, b) => (a.points < b.points ? 1 : -1));

        const c = new Canvas(640, 391);
        const background = new Canvas.Image();
        const imgAvatar = new Canvas.Image();
        const themeImage = new Canvas.Image();
        const ctx = c.getContext("2d");

        const [themeImageSRC, backgroundSRC, imgAvatarSRC] = await Promise.all([
            snekfetch.get(url).then(d => d.body),
            readFile(profileTemplate),
            fetchAvatar(user, 256),
        ]);

        themeImage.onload = () => ctx.drawImage(themeImage, 10, 9, 188, 373);
        themeImage.src = themeImageSRC;

        /* Draw the background */
        background.onload = () => ctx.drawImage(background, 0, 0, 640, 391);
        background.src = backgroundSRC;
        ctx.fillStyle = `#${color}`;
        ctx.fillRect(235, 356, Prog, 5);

        /* Draw the information */
        ctx.font = "35px RobotoRegular";
        ctx.fillStyle = "rgb(23,23,23)";
        ctx.fillText(user.username, 227, 73);
        ctx.font = "25px RobotoLight";
        ctx.fillText(`#${user.discriminator}`, 227, 105);
        ctx.textAlign = "right";
        const GlobalPosition = exists ? sortedList.map(l => l.id).indexOf(user.id) + 1 : "unranked";
        ctx.fillText(GlobalPosition, 594, 276);
        ctx.fillText(money, 594, 229);
        ctx.fillText(reputation, 594, 181);
        ctx.fillText(points, 594, 346);
        ctx.textAlign = "center";
        ctx.font = "40px RobotoRegular";
        ctx.fillText(currentLevel, 576, 100);

        /* Draw the avatar */
        ctx.save();
        ctx.beginPath();
        ctx.arc(103, 102, 70, 0, Math.PI * 2, false);
        ctx.clip();
        imgAvatar.onload = () => ctx.drawImage(imgAvatar, 32, 31, 141, 141);
        imgAvatar.src = imgAvatarSRC;
        ctx.restore();

        /* Resolve Canvas buffer */
        return c.toBuffer();
    }

};
