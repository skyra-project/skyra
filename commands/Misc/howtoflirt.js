const { fetchAvatar } = require("../../functions/wrappers");
const { User: fetchUser } = require("../../functions/search");
const { readFile } = require("fs-nextra");
const Canvas = require("canvas");
const { join, resolve } = require("path");

const template = resolve(join(__dirname, "../../assets/images/memes/howtoflirt.png"));

const How2Flirt = async (client, msg, user) => {
  /* Initialize Canvas */
    const c = new Canvas(500, 500);
    const background = new Canvas.Image();
    const user1 = new Canvas.Image();
    const user2 = new Canvas.Image();
    const ctx = c.getContext("2d");

    if (user.id === msg.author.id) user = client.user;

    const coord1 = [
      { center: [211, 53], radius: 18 },
      { center: [136, 237], radius: 53 },
      { center: [130, 385], radius: 34 },
    ];
    const coord2 = [
      { center: [35, 25], radius: 22 },
      { center: [326, 67], radius: 50 },
      { center: [351, 229], radius: 43 },
      { center: [351, 390], radius: 40 },
    ];

  /* Get the buffers from both profile avatars */
    const [bgBuffer, user1Buffer, user2Buffer] = await Promise.all([
        readFile(template),
        fetchAvatar(msg.author, 128),
        fetchAvatar(user, 128),
    ]);

    /* Background */
    background.onload = () => ctx.drawImage(background, 0, 0, 500, 500);
    background.src = bgBuffer;
    user1.src = user1Buffer;
    user2.src = user2Buffer;

    /* Tony */
    await Promise.all(coord1.map(({ center, radius }) => new Promise((res) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(center[0], center[1], radius, 0, Math.PI * 2, false);
        ctx.clip();
        ctx.drawImage(user1, center[0] - radius, center[1] - radius, radius * 2, radius * 2);
        ctx.restore();
        res();
    })));
    /* Capitain */
    await Promise.all(coord2.map(({ center, radius }) => new Promise((res) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(center[0], center[1], radius, 0, Math.PI * 2, false);
        ctx.clip();
        ctx.drawImage(user2, center[0] - radius, center[1] - radius, radius * 2, radius * 2);
        user2.src = user2Buffer;
        ctx.restore();
        res();
    })));

    /* Resolve Canvas buffer */
    return c.toBuffer();
};

exports.run = async (client, msg, [search]) => {
    const user = await fetchUser(search, msg.guild);
    const output = await How2Flirt(client, msg, user);
    return msg.channel.send({ files: [{ attachment: output, name: "How2Flirt.png" }] });
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
    name: "howtoflirt",
    description: "I'll teach you how to flirt.",
    usage: "<user:string>",
    usageDelim: "",
    extendedHelp: "",
};
