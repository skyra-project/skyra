const { Command, Canvas } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const { readFile } = require('fs-nextra');
const { join } = require('path');

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

        this.template = null;
    }

    async run(msg, [user]) {
        const attachment = await this.generate(msg, user);
        return msg.channel.send({ files: [{ attachment, name: 'It\'s Goofy time.png' }] });
    }

    async generate(msg, user) {
        const goofied = await fetchAvatar(user, 128);

        return new Canvas(356, 435)
            .addImage(this.template, 0, 0, 356, 435)
            .addImage(goofied, 199, 52, 92, 92, { type: 'round', radius: 46 })
            .toBufferAsync();
    }

    async init() {
        this.template = await readFile(join(__dirname, '../../assets/images/memes/goofy.png'));
    }

};
