const { readFile } = require("fs-nextra");
const { join, sep } = require("path");
const Canvas = require("canvas");
const { fetchAll: fetchGlobal } = require("../../utils/managerSocialGlobal");

Canvas.registerFont(join(__dirname, "../../assets/fonts/Roboto-Regular.ttf"), { family: "RobotoRegular" });
Canvas.registerFont(join(__dirname, "../../assets/fonts/Roboto-Light.ttf"), { family: "RobotoLight" });

const profileTemplate = join(__dirname, "../../assets/images/social/profile-foreground.png");
const themes = join(__dirname, "../../assets/images/social/themes/") + sep;

const showProfile = async (client, user) => {
  const { points, color, banners, exists, money, reputation } = user.profile;

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

  const theme = banners.theme;
  const [themeImageSRC, backgroundSRC, imgAvatarSRC] = await Promise.all([
    readFile(`${themes}${theme}.png`),
    readFile(profileTemplate),
    client.funcs.wrappers.fetchAvatar(user, 256),
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
};

exports.run = async (client, msg, [search = msg.author]) => {
  const user = await client.funcs.search.User(search, msg.guild);
  const output = await showProfile(client, user);
  return msg.channel.send({ files: [{ attachment: output, name: "Profile.png" }] });
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: true,
  mode: 1,
  cooldown: 30,
};

exports.help = {
  name: "profile",
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
