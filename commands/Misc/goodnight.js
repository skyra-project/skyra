const { Command, Canvas } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const { readFile } = require('fs-nextra');
const { join, resolve } = require('path');

const template = resolve(join(__dirname, '../../assets/images/memes/goodnight.png'));

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            botPerms: ['ATTACH_FILES'],
            guildOnly: true,

            cooldown: 30,

            usage: '<user:advuser>',
            description: 'Give somebody a nice Good Night!'
        });
    }

    async run(msg, [user]) {
        const attachment = await this.generate(msg, user);
        return msg.channel.send({ files: [{ attachment, name: 'goodNight.png' }] });
    }

    async generate(msg, user) {
        if (user.id === msg.author.id) user = this.client.user;

        const [background, kisser, child] = await Promise.all([
            readFile(template),
            fetchAvatar(msg.author, 256),
            fetchAvatar(user, 256)
        ]);

        return new Canvas(500, 322)
            .addImage(background, 0, 0, 636, 366)
            .save()
            .addImage(kisser, 315, 25, 146, 146, { type: 'round', radius: 73 })
            .restore()
            .addImage(child, 350, 170, 110, 110, { type: 'round', radius: 55 })
            .toBufferAsync();
    }

};
