const { User: fetchUser } = require("../../functions/search");
const { fetchAvatar } = require("../../functions/wrappers");
const { readFile } = require("fs-nextra");
const { join, sep } = require("path");
const Canvas = require("canvas");

Canvas.registerFont(join(__dirname, "../../assets/fonts/Roboto-Regular.ttf"), { family: "RobotoRegular" });
Canvas.registerFont(join(__dirname, "../../assets/fonts/Roboto-Light.ttf"), { family: "RobotoLight" });

const profileTemplate = join(__dirname, "../../assets/images/social/level-foreground.png");
const themes = join(__dirname, "../../assets/images/social/themes/") + sep;

const showProfile = async (client, user) => {
    const { points, color, banners } = user.profile;

    /* Calculate information from the user */
    const currentLevel = Math.floor(0.2 * Math.sqrt(points));
    const previousLevel = Math.floor((currentLevel / 0.2) ** 2);
    const nextLevel = Math.floor(((currentLevel + 1) / 0.2) ** 2);
    const Prog = Math.round(((points - previousLevel) / (nextLevel - previousLevel)) * 265);

    const c = new Canvas(640, 174);
    const background = new Canvas.Image();
    const imgAvatar = new Canvas.Image();
    const themeImage = new Canvas.Image();
    const ctx = c.getContext("2d");

    const theme = banners.level;
    const [themeImageSRC, backgroundSRC, imgAvatarSRC] = await Promise.all([
        readFile(`${themes}${theme}.png`),
        readFile(profileTemplate),
        fetchAvatar(user, 256),
    ]);

    themeImage.onload = () => ctx.drawImage(themeImage, 10, 9, 189, 157);
    themeImage.src = themeImageSRC;

    /* Draw the background */
    background.onload = () => ctx.drawImage(background, 0, 0, 640, 174);
    background.src = backgroundSRC;
    ctx.fillStyle = `#${color}`;
    ctx.fillRect(341, 88, Prog, 5);

    /* Draw the information */
    ctx.fillStyle = "rgb(23,23,23)";
    ctx.font = "28px RobotoLight";
    ctx.textAlign = "right";
    ctx.fillText(points, 606, 68);
    ctx.fillText(`${nextLevel - points}`, 606, 128);
    ctx.textAlign = "center";
    ctx.font = "45px RobotoRegular";
    ctx.fillText(currentLevel, 273, 128);

    /* Draw the avatar */
    ctx.save();
    ctx.beginPath();
    ctx.arc(103.5, 87.5, 69.5, 0, Math.PI * 2, false);
    ctx.clip();
    imgAvatar.onload = () => ctx.drawImage(imgAvatar, 34, 18, 139, 139);
    imgAvatar.src = imgAvatarSRC;
    ctx.restore();

    /* Resolve Canvas buffer */
    return c.toBuffer();
};

exports.run = async (client, msg, [search = msg.author]) => {
    const user = await fetchUser(search, msg.guild);
    const output = await showProfile(client, user);
    return msg.channel.send({ files: [{ attachment: output, name: "Profile.png" }] });
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: ["lvl"],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: true,
    mode: 1,
    cooldown: 30,
};

exports.help = {
    name: "level",
    description: "Check your profile.",
    usage: "[user:string]",
    usageDelim: "",
    extendedHelp: [
        "Check all information I have from you :)",
        "",
        "Usage:",
        "&profile [user]",
        "",
        " ❯ User: the user you want to display info about.",
    ].join("\n"),
};
