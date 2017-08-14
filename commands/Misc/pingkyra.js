const { Command } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const { readFile } = require('fs-nextra');
const { join, resolve } = require('path');
const Canvas = require('canvas');

const template = resolve(join(__dirname, '../../assets/images/memes/pingkyra.png'));

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,

            cooldown: 30,

            usage: '<user:advuser>',
            description: 'How you dare pinging me!'
        });

        this.kyra = null;
    }

    async run(msg, [user]) {
        const output = await this.generate(msg, user);
        return msg.channel.send({ files: [{ attachment: output, name: 'pingkyra.png' }] });
    }

    async generate(msg, user) {
        if (user.id === this.kyra.id || user.id === this.client.user.id) user = msg.author;

        const canvas = new Canvas(569, 327);
        const background = new Canvas.Image();
        const pinner = new Canvas.Image();
        const Kyra = new Canvas.Image();
        const ctx = canvas.getContext('2d');

        /* Get the buffers from both profile avatars */
        const [bgBuffer, pinnerBuffer, KyraBuffer] = await Promise.all([
            readFile(template),
            fetchAvatar(user, 128),
            fetchAvatar(this.kyra, 128)
        ]);

        /* Background */
        background.onload = () => ctx.drawImage(background, 0, 0, 569, 327);
        background.src = bgBuffer;

        /* Hammered */
        ctx.save();
        ctx.beginPath();
        ctx.arc(144, 53, 26, 0, Math.PI * 2, false);
        ctx.clip();
        pinner.onload = () => ctx.drawImage(pinner, 118, 27, 52, 52);
        pinner.src = pinnerBuffer;
        ctx.restore();

        /* Hammerer */
        ctx.save();
        ctx.beginPath();
        ctx.arc(393, 59, 25, 0, Math.PI * 2, false);

        ctx.clip();
        Kyra.onload = () => ctx.drawImage(Kyra, 368, 34, 50, 50);
        Kyra.src = KyraBuffer;
        ctx.restore();

        return canvas.toBuffer();
    }

    async init() {
        this.kyra = await this.client.fetchUser('242043489611808769');
    }

};
