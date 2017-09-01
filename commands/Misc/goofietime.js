const { Command, Canvas } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const { readFile } = require('fs-nextra');
const { join, resolve } = require('path');

const template = resolve(join(__dirname, '../../assets/images/memes/goofy.png'));

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            botPerms: ['ATTACH_FILES'],
            aliases: ['goof', 'daddy'],
            guildOnly: true,

            cooldown: 30,

            usage: '<user:advuser>',
            description: 'It\'s Goofy time!'
        });
    }

    async run(msg, [user]) {
        const attachment = await this.generate(msg, user);
        return msg.channel.send({ files: [{ attachment, name: 'It\'s Goofy time.png' }] });
    }

    async generate(msg, user) {
        const [background, goofied] = await Promise.all([
            readFile(template),
            fetchAvatar(user, 128)
        ]);

        return new Canvas(356, 435)
            .addImage(background, 0, 0, 356, 435)
            .addImage(goofied, 199, 52, 92, 92, { type: 'round', radius: 46 })
            .toBufferAsync();
    }

};
