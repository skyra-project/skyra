const Canvas = require("canvas");
const readFileAsync = require("tsubaki").promisify(require("fs").readFile);
const { sep } = require("path");
const { fetchAll: fetchGlobal } = require("../../utils/managerSocialGlobal");

const socialAssets = client => `${client.clientBaseDir}assets${sep}images${sep}social${sep}`;
const fontAssets = client => `${client.clientBaseDir}assets${sep}fonts${sep}`;

/* eslint-disable no-confusing-arrow, no-unused-vars */
const showProfile = async (client, user) => {
  const profile = user.profile;
  const themes = `${socialAssets(client)}themes${sep}`;

  /* Calculate information from the user */
  const currentLevel = Math.floor(0.2 * Math.sqrt(profile.points));
  const previousLevel = Math.floor((currentLevel / 0.2) ** 2);
  const nextLevel = Math.floor(((currentLevel + 1) / 0.2) ** 2);
  const Prog = Math.round(((profile.points - previousLevel) / (nextLevel - previousLevel)) * 356);

  const red = parseInt(profile.color.substring(0, 2), 16);
  const green = parseInt(profile.color.substring(2, 4), 16);
  const blue = parseInt(profile.color.substring(4, 6), 16);

  /* Global leaderboard */
  const sortedList = fetchGlobal().sort((a, b) => a.points < b.points ? 1 : -1);

  const c = new Canvas(640, 391);
  const background = new Canvas.Image();
  const imgAvatar = new Canvas.Image();
  const themeImage = new Canvas.Image();
  const ctx = c.getContext("2d");

  /* Load fonts */
  const RobotoBold = new Canvas.Font("RobotoBold", `${fontAssets(client)}Roboto-Bold.ttf`);
  const RobotoLight = new Canvas.Font("RobotoLight", `${fontAssets(client)}Roboto-Light.ttf`);

  const theme = profile.banners.theme;
  const [themeImageSRC, backgroundSRC, imgAvatarSRC] = await Promise.all([
    readFileAsync(`${themes}${theme}.png`),
    readFileAsync(`${socialAssets(client)}profile-foreground.png`),
    client.wrappers.fetchAvatar(user, 256),
  ]);


  themeImage.onload = () => ctx.drawImage(themeImage, 10, 9, 188, 373);
  themeImage.src = themeImageSRC;

  /* Draw the background */
  background.onload = () => ctx.drawImage(background, 0, 0, 640, 391);
  background.src = backgroundSRC;
  ctx.fillStyle = `rgb(${red} , ${green}, ${blue})`;
  ctx.fillRect(235, 356, Prog, 5);

  /* Draw the information */
  ctx.font = "35px RobotoBold";
  ctx.fillStyle = "rgb(23,23,23)";
  ctx.fillText(user.username, 227, 73);
  ctx.font = "25px RobotoLight";
  ctx.fillText(`#${user.discriminator}`, 227, 105);
  ctx.textAlign = "right";
  const GlobalPosition = profile.exists ? sortedList.map(l => l.id).indexOf(user.id) + 1 : "unranked";
  ctx.fillText(GlobalPosition, 594, 276);
  ctx.fillText(profile.money, 594, 229);
  ctx.fillText(profile.reputation, 594, 181);
  ctx.fillText(profile.points, 594, 349);
  ctx.textAlign = "center";
  ctx.font = "40px RobotoBold";
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
  await msg.channel.sendFile(output, "Profile.png");
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
