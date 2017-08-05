const { Command } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const { roundImage } = require('../../functions/canvas');
const { readFile } = require('fs-nextra');
const { join, resolve } = require('path');
const Canvas = require('canvas');

const template = resolve(join(__dirname, '../../assets/images/memes/goodnight.png'));

/* eslint-disable class-methods-use-this */
module.exports = class extends Command {

    constructor(...args) {
        super(...args, 'goodnight', {
            guildOnly: true,

            usage: '<user:advuser>',
            description: 'Give somebody a nice Good Night!'
        });
    }

    async run(msg, [user]) {
        const output = await this.generate(msg, user);
        return msg.channel.send({ files: [{ attachment: output, name: 'GoodNight.png' }] });
    }

    async generate(msg, user) {
        const canvas = new Canvas(500, 322);
        const background = new Canvas.Image();
        const kisser = new Canvas.Image();
        const child = new Canvas.Image();
        const ctx = canvas.getContext('2d');

        if (user.id === msg.author.id) user = this.client.user;

        /* Get the buffers from both profile avatars */
        const [bgBuffer, kisserBuffer, childBuffer] = await Promise.all([
            readFile(template),
            fetchAvatar(msg.author, 256),
            fetchAvatar(user, 256)
        ]);
        background.src = bgBuffer;
        kisser.src = kisserBuffer;
        child.src = childBuffer;

        background.onload = () => ctx.drawImage(background, 0, 0, 636, 366);
        roundImage(ctx, kisser, 300, 98, 73);
        roundImage(ctx, child, 322, 212, 55);

        return canvas.toBuffer();
    }

};
