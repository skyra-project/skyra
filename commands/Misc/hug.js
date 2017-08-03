const { fetchAvatar } = require('../../functions/wrappers');
const { readFile } = require('fs-nextra');
const { join, resolve } = require('path');
const Canvas = require('canvas');

const template = resolve(join(__dirname, '../../assets/images/memes/hug.png'));

const hug = async (client, msg, user) => {
    /* Initialize Canvas */
    const canvas = new Canvas(660, 403);
    const background = new Canvas.Image();
    const user1 = new Canvas.Image();
    const user2 = new Canvas.Image();
    const ctx = canvas.getContext('2d');

    if (user.id === msg.author.id) user = client.user;

    /* Get the buffers from both profile avatars */
    const [bgBuffer, user1Buffer, user2Buffer] = await Promise.all([
        readFile(template),
        fetchAvatar(user, 256),
        fetchAvatar(msg.author, 256)
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

    return canvas.toBuffer();
};

exports.run = async (client, msg, [user]) => {
    const output = await hug(client, msg, user);
    return msg.channel.send({ files: [{ attachment: output, name: 'Hug.png' }] });
};

exports.conf = {
    enabled: true,
    runIn: ['text'],
    aliases: [],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 0,
    cooldown: 30
};

exports.help = {
    name: 'hug',
    description: 'Hugs!',
    usage: '<user:advuser>',
    usageDelim: '',
    extendedHelp: [
        'Hugs!',
        '',
        "&hug Kyra will create a picture of your profile picture hugging Kyra's profile picture.",
        'If feeling lonely, hugging yourself will give you a nice surprise!'
    ].join('\n')
};
