const { Command } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const { readFile } = require('fs-nextra');
const { join, resolve } = require('path');
const Canvas = require('canvas');

const template = resolve(join(__dirname, '../../assets/images/memes/DeletThis.png'));

/* eslint-disable class-methods-use-this */
module.exports = class DeletThis extends Command {

    constructor(...args) {
        super(...args, 'deletthis', {
            aliases: ['deletethis'],
            guildOnly: true,
            mode: 0,

            usage: '<user:user>',
            description: "I'll hammer you anyway."
        });
    }

    async run(msg, [user]) {
        const output = await this.deletthis(msg, user);
        return msg.channel.send({ files: [{ attachment: output, name: 'DeletThis.png' }] });
    }

    async deletthis(msg, user) {
        let selectedUser;
        let hammerer;
        if (user === msg.author) [selectedUser, hammerer] = [msg.author, this.client.users.get('242043489611808769')];
        else if (['242043489611808769', '251484593859985411'].includes(user.id)) [selectedUser, hammerer] = [msg.author, user];
        else [selectedUser, hammerer] = [user, msg.author];

        /* Initialize Canvas */
        const canvas = new Canvas(650, 471);
        const background = new Canvas.Image();
        const imgHammered = new Canvas.Image();
        const imgHammerer = new Canvas.Image();
        const ctx = canvas.getContext('2d');

        /* Get the buffers from both profile avatars */
        const [bgBuffer, Hammered, Hammerer] = await Promise.all([
            readFile(template),
            fetchAvatar(selectedUser, 256),
            fetchAvatar(hammerer, 256)
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

        return canvas.toBuffer();
    }

};
