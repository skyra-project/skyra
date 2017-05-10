const Canvas = require("canvas");
const fsp = require("fs-extra-promise");
const { sep } = require("path");

const DeletThis = async (client, msg, user) => {
  let selectedUser;
  let hammerer;
  if (user === msg.author) {
    selectedUser = msg.author;
    hammerer = client.users.get("242043489611808769");
  } else if (["242043489611808769", "251484593859985411"].includes(user.id)) {
    selectedUser = msg.author;
    hammerer = user;
  } else {
    selectedUser = user;
    hammerer = msg.author;
  }

  /* Initialize Canvas */
  const c = new Canvas(650, 471);
  const background = new Canvas.Image();
  const imgHammered = new Canvas.Image();
  const imgHammerer = new Canvas.Image();
  const ctx = c.getContext("2d");

    /* Get the buffers from both profile avatars */
  const [bgBuffer, Hammered, Hammerer] = await Promise.all([
    fsp.readFileAsync(`${client.constants.assets}images${sep}memes${sep}DeletThis.png`),
    client.wrappers.canvasAvatar(selectedUser.displayAvatarURL),
    client.wrappers.canvasAvatar(hammerer.displayAvatarURL),
  ]);

    /* Background */
  background.onload = () => ctx.drawImage(background, 0, 0, 650, 471);
  background.src = bgBuffer;

    /* Hammered */
  ctx.save();
  ctx.beginPath();
  ctx.arc(526, 224, 77, 0, Math.PI * 2, false);
  ctx.clip();
  imgHammered.onload = () => {
    ctx.translate(449, 147);
    ctx.rotate(0.2);
    ctx.drawImage(imgHammered, 13, -17, 155, 155);
  };
  imgHammered.src = Hammered;
  ctx.restore();

    /* Hammerer */
  ctx.save();
  ctx.beginPath();
  ctx.arc(350, 132, 77, 0, Math.PI * 2, false);

  ctx.clip();
  imgHammerer.onload = () => {
    ctx.translate(273, 55);
    ctx.rotate(0.2);
    ctx.drawImage(imgHammerer, 14, -17, 155, 155);
  };
  imgHammerer.src = Hammerer;
  ctx.restore();

    /* Resolve Canvas buffer */
  return c.toBuffer();
};

exports.run = async (client, msg, [search]) => {
  const user = await client.search.User(search, msg.guild);
  const output = await DeletThis(client, msg, user);
  await msg.channel.sendFile(output, "DeletThis.png");
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: ["deletethis"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 0,
  cooldown: 30,
};

exports.help = {
  name: "deletthis",
  description: "I'll hammer you anyway.",
  usage: "<user:string>",
  usageDelim: "",
  extendedHelp: "",
};
