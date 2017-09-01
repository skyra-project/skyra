const { Command, Canvas } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const { readFile } = require('fs-nextra');
const { join, resolve } = require('path');

const template = resolve(join(__dirname, '../../assets/images/memes/ineedhealing.png'));

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            botPerms: ['ATTACH_FILES'],
            guildOnly: true,

            cooldown: 30,

            usage: '<user:advuser>',
            description: 'I NEED HEALING!'
        });
    }

    async run(msg, [user]) {
        const attachment = await this.generate(msg, user);
        return msg.channel.send({ files: [{ attachment, name: 'INeedHealing.png' }] });
    }

    async generate(msg, user) {
        if (user.id === msg.author.id) user = this.client.user;

        const [background, healer, healed] = await Promise.all([
            readFile(template),
            fetchAvatar(msg.author, 128),
            fetchAvatar(user, 128)
        ]);

        return new Canvas(333, 500)
            .addImage(background, 0, 0, 333, 500)
            .save()
            .addImage(healer, 189, 232, 110, 110, { type: 'round', radius: 55 })
            .restore()
            .addImage(healed, 70, 96, 106, 106, { type: 'round', radius: 53 })
            .toBufferAsync();
    }

};
