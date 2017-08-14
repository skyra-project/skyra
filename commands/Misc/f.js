const { Command } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const { readFile } = require('fs-nextra');
const { join, resolve } = require('path');
const Canvas = require('canvas');

const template = resolve(join(__dirname, '../../assets/images/memes/f.png'));

/* eslint-disable class-methods-use-this */
module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['pray'],
            guildOnly: true,

            usage: '<user:advuser>',
            description: 'Press F to pray respects.'
        });
    }

    async run(msg, [user]) {
        const output = await this.generate(msg, user);
        return msg.channel.send({ files: [{ attachment: output, name: 'F.png' }] });
    }

    async generate(msg, user) {
        /* Initialize Canvas */
        const canvas = new Canvas(960, 540);
        const foreground = new Canvas.Image();
        const imgPraised = new Canvas.Image();
        const ctx = canvas.getContext('2d');

        /* Get the buffers from the praised user's profile avatar */
        const [bgBuffer, praised] = await Promise.all([
            readFile(template),
            fetchAvatar(user, 256)
        ]);

        /* Draw the buffer */
        imgPraised.onload = () => ctx.drawImage(imgPraised, 349, 87, 109, 109);
        imgPraised.src = praised;

        /* Foreground */
        foreground.onload = () => ctx.drawImage(foreground, 0, 0, 960, 540);
        foreground.src = bgBuffer;

        return canvas.toBuffer();
    }

};
