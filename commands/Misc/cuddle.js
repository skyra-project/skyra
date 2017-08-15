const { Command } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const { readFile } = require('fs-nextra');
const { join, resolve } = require('path');
const Canvas = require('../../utils/canvas-constructor');

const template = resolve(join(__dirname, '../../assets/images/memes/cuddle.png'));

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,

            cooldown: 30,

            usage: '<user:advuser>',
            description: 'Cuddle somebody!'
        });
    }

    async run(msg, [user]) {
        const output = await this.generate(msg, user);
        return msg.channel.send({ files: [{ attachment: output, name: 'Cuddle.png' }] });
    }

    async generate(msg, user) {
        if (user.id === msg.author.id) user = this.client.user;

        /* Get the buffers from both profile avatars */
        const [background, man, woman] = await Promise.all([
            readFile(template),
            fetchAvatar(msg.author, 256),
            fetchAvatar(user, 256)
        ]);

        return new Canvas(636, 366)
            .addImage(background, 0, 0, 636, 366)
            .addImage(man, 168, -7, 140, 140, { type: 'Round', radius: 70 })
            .addImage(woman, 307, 41, 138, 138, { type: 'Round', radius: 69 })
            .toBuffer();
    }

};
