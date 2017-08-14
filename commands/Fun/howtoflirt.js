const { Command } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const { roundImage } = require('../../functions/canvas');
const { readFile } = require('fs-nextra');
const { join, resolve } = require('path');
const Canvas = require('canvas');

const template = resolve(join(__dirname, '../../assets/images/memes/howtoflirt.png'));

const coord1 = [
    [211, 53, 18],
    [136, 237, 53],
    [130, 385, 34]
];
const coord2 = [
    [35, 25, 22],
    [326, 67, 50],
    [351, 229, 43],
    [351, 390, 40]
];

/* eslint-disable class-methods-use-this */
module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,

            usage: '<user:advuser>',
            description: "I'll teach you how to flirt."
        });
    }

    async run(msg, [user]) {
        const output = await this.generate(msg, user);
        return msg.channel.send({ files: [{ attachment: output, name: 'HowToFlirt.png' }] });
    }

    async generate(msg, user) {
        const canvas = new Canvas(500, 500);
        const background = new Canvas.Image();
        const tony = new Canvas.Image();
        const capitain = new Canvas.Image();
        const ctx = canvas.getContext('2d');

        if (user.id === msg.author.id) user = this.client.user;

        /* Get the buffers from both profile avatars */
        const [bgBuffer, tonyBuffer, cpBuffer] = await Promise.all([
            readFile(template),
            fetchAvatar(msg.author, 128),
            fetchAvatar(user, 128)
        ]);
        background.src = bgBuffer;
        tony.src = tonyBuffer;
        capitain.src = cpBuffer;

        background.onload = () => ctx.drawImage(background, 0, 0, 500, 500);

        await Promise.all(coord1.map(([x, y, radius]) => new Promise((res) => {
            roundImage(ctx, tony, x, y, radius);
            res();
        })));
        await Promise.all(coord2.map(([x, y, radius]) => new Promise((res) => {
            roundImage(ctx, capitain, x, y, radius);
            res();
        })));

        return canvas.toBuffer();
    }

};
