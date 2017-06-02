const constants = require("../../utils/constants");
const { readFile } = require("fs-nextra");
const Canvas = require("canvas");
const { sep } = require("path");

const Pray = async (client, user) => {
  /* Initialize Canvas */
  const canvas = new Canvas(960, 540);
  const foreground = new Canvas.Image();
  const imgPraised = new Canvas.Image();
  const ctx = canvas.getContext("2d");

  /* Get the buffers from the praised user's profile avatar */
  const [bgBuffer, praised] = await Promise.all([
    readFile(`${constants.assets}images${sep}memes${sep}f.png`),
    client.wrappers.fetchAvatar(user, 256),
  ]);

  /* Draw the buffer */
  imgPraised.onload = () => ctx.drawImage(imgPraised, 349, 87, 109, 109);
  imgPraised.src = praised;

  /* Foreground */
  foreground.onload = () => ctx.drawImage(foreground, 0, 0, 960, 540);
  foreground.src = bgBuffer;

  /* Resolve Canvas buffer */
  return canvas.toBuffer();
};

exports.run = async (client, msg, [search = msg.author]) => {
  const user = await client.funcs.search.User(search, msg.guild);
  const output = await Pray(client, user);
  await msg.channel.sendFile(output, "f.png");
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: ["pray"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 0,
  cooldown: 30,
};

exports.help = {
  name: "f",
  description: "Press F to pray respects.",
  usage: "<user:string>",
  usageDelim: "",
  extendedHelp: "",
};
