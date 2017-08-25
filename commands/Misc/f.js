const { Command, Canvas } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const { readFile } = require('fs-nextra');
const { join, resolve } = require('path');

const template = resolve(join(__dirname, '../../assets/images/memes/f.png'));

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['pray'],
            guildOnly: true,

            cooldown: 30,

            usage: '<user:advuser>',
            description: 'Press F to pray respects.'
        });
    }

    async run(msg, [user]) {
        const output = await this.generate(msg, user);
        return msg.channel.send({ files: [{ attachment: output, name: 'F.png' }] })
            .then(message => msg.channel.permissionsFor(msg.guild.me).has('ADD_REACTIONS') ? message.react('🇫') : message);
    }

    async generate(msg, user) {
        const [background, praised] = await Promise.all([
            readFile(template),
            fetchAvatar(user, 256)
        ]);

        return new Canvas(960, 540)
            .addImage(praised, 349, 87, 109, 109)
            .addImage(background, 0, 0, 960, 540)
            .toBufferAsync();
    }

};
