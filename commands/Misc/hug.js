const Canvas = require("canvas");
const fsp = require("fs-extra-promise");
const { sep } = require("path");

const Hug = async (client, msg, user) => {
  /* Initialize Canvas */
  const c = new Canvas(660, 403);
  const background = new Canvas.Image();
  const user1 = new Canvas.Image();
  const user2 = new Canvas.Image();
  const ctx = c.getContext("2d");

  if (user.id === msg.author.id) user = client.user;

  /* Get the buffers from both profile avatars */
  const [bgBuffer, user1Buffer, user2Buffer] = await Promise.all([
    fsp.readFileAsync(`${client.constants.assets}images${sep}memes${sep}hug.png`),
    client.wrappers.canvasAvatar(user.displayAvatarURL),
    client.wrappers.canvasAvatar(msg.author.displayAvatarURL),
  ]);

    /* Background */
  background.onload = () => ctx.drawImage(background, 0, 0, 660, 403);
  background.src = bgBuffer;

    /* Hammered */
  ctx.save();
  ctx.beginPath();
  ctx.arc(178, 147, 54, 0, Math.PI * 2, false);
  ctx.clip();
  user1.onload = () => ctx.drawImage(user1, 124, 92, 109, 109);
  user1.src = user1Buffer;
  ctx.restore();

    /* Hammerer */
  ctx.save();
  ctx.beginPath();
  ctx.arc(282, 106, 49, 0, Math.PI * 2, false);
  ctx.clip();
  user2.onload = () => ctx.drawImage(user2, 233, 57, 98, 98);
  user2.src = user2Buffer;
  ctx.restore();

    /* Resolve Canvas buffer */
  return c.toBuffer();
};

exports.run = async (client, msg, [search]) => {
  try {
    const user = await client.search.User(search, msg.guild);
    const output = await Hug(client, msg, user);
    await msg.channel.sendFile(output, "Hug.png");
  } catch (e) {
    msg.error(e);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 0,
  cooldown: 30,
};

exports.help = {
  name: "hug",
  description: "Hugs!",
  usage: "<user:string>",
  usageDelim: "",
  extendedHelp: [
    "Hugs!",
    "",
    "&hug Kyra will create a picture of your profile picture hugging Kyra's profile picture.",
    "If feeling lonely, hugging yourself will give you a nice surprise!",
  ].join("\n"),
};
