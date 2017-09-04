const { Command } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const { readFile } = require('fs-nextra');
const { join, resolve } = require('path');
const Canvas = require('canvas');

const template = resolve(join(__dirname, '../../assets/images/memes/howtoflirt.png'));

const coord1 = [
    { center: [211, 53], radius: 18 },
    { center: [136, 237], radius: 53 },
    { center: [130, 385], radius: 34 }
];
const coord2 = [
    { center: [35, 25], radius: 22 },
    { center: [326, 67], radius: 50 },
    { center: [351, 229], radius: 43 },
    { center: [351, 390], radius: 40 }
];

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,

            cooldown: 30,

            usage: '<user:advuser>',
            description: 'I will teach you how to flirt.',
            extend: {
                EXPLANATION: [
                    'Let me teach you how to flirt with somebody using the Tony Stark\'s style for Capitain America, and',
                    'have lots of fun with it!'
                ].join(' '),
                ARGUMENTS: '<user>',
                EXP_USAGE: [
                    ['user', 'A user to flirt with.']
                ],
                EXAMPLES: ['Skyra']
            }
        });
    }

    async run(msg, [user]) {
        const attachment = await this.generate(msg, user);
        return msg.channel.send({ files: [{ attachment, name: 'HowToFlirt.png' }] });
    }

    async generate(msg, user) {
        /* Initialize Canvas */
        const canvas = new Canvas(500, 500);
        const background = new Canvas.Image();
        const user1 = new Canvas.Image();
        const user2 = new Canvas.Image();
        const ctx = canvas.getContext('2d');

        if (user.id === msg.author.id) user = this.client.user;

        /* Get the buffers from both profile avatars */
        const [bgBuffer, user1Buffer, user2Buffer] = await Promise.all([
            readFile(template),
            fetchAvatar(msg.author, 128),
            fetchAvatar(user, 128)
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

        return canvas.toBuffer();
    }

};
