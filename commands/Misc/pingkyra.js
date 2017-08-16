const { Command } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const { readFile } = require('fs-nextra');
const { join, resolve } = require('path');
const Canvas = require('../../utils/canvas-constructor');

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
        if (user.id === this.kyra.id || user.id === this.client.user.id) user = msg.author;
        const output = await this.generate(msg, user);
        return msg.channel.send({ files: [{ attachment: output, name: 'pingkyra.png' }] });
    }

    async generate(msg, user) {
        const [background, runner, kyra] = await Promise.all([
            readFile(template),
            fetchAvatar(user, 128),
            fetchAvatar(this.kyra, 128)
        ]);

        return new Canvas(569, 327)
            .addImage(background, 0, 0, 569, 327)
            .save()
            .addImage(runner, 118, 27, 52, 52, { type: 'round', radius: 26 })
            .restore()
            .addImage(kyra, 368, 34, 50, 50, { type: 'round', radius: 25 })
            .toBufferAsync();
    }

    async init() {
        this.kyra = await this.client.fetchUser('242043489611808769');
    }

};
