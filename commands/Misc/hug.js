const { Command } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const { readFile } = require('fs-nextra');
const { join, resolve } = require('path');
const Canvas = require('../../utils/canvas-constructor');

const template = resolve(join(__dirname, '../../assets/images/memes/hug.png'));

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,

            cooldown: 30,

            usage: '<user:advuser>',
            description: 'Hugs!'
        });
    }

    async run(msg, [user]) {
        if (user.id === msg.author.id) user = this.client.user;
        const output = await this.generate(msg, user);
        return msg.channel.send({ files: [{ attachment: output, name: 'Hug.png' }] });
    }

    async generate(msg, user) {
        const [background, hugged, hugger] = await Promise.all([
            readFile(template),
            fetchAvatar(user, 256),
            fetchAvatar(msg.author, 256)
        ]);

        return new Canvas(660, 403)
            .addImage(background, 0, 0, 660, 403)
            .save()
            .addImage(hugger, 124, 92, 109, 109, { type: 'round', radius: 54 })
            .restore()
            .addImage(hugged, 233, 57, 98, 98, { type: 'round', radius: 49 })
            .toBufferAsync();
    }

};
