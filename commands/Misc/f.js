const { fetchAvatar } = require("../../functions/wrappers");
const { User: fetchUser } = require("../../functions/search");
const { readFile } = require("fs-nextra");
const Canvas = require("canvas");
const { join, resolve } = require("path");

const template = resolve(join(__dirname, "../../assets/images/memes/f.png"));

const Pray = async (client, user) => {
  /* Initialize Canvas */
    const canvas = new Canvas(960, 540);
    const foreground = new Canvas.Image();
    const imgPraised = new Canvas.Image();
    const ctx = canvas.getContext("2d");

  /* Get the buffers from the praised user's profile avatar */
    const [bgBuffer, praised] = await Promise.all([
        readFile(template),
        fetchAvatar(user, 256),
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
    const user = await fetchUser(search, msg.guild);
    const output = await Pray(client, user);
    return msg.channel.send({ files: [{ attachment: output, name: "f.png" }] });
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
