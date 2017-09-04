const { Command, Canvas } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const { readFile } = require('fs-nextra');
const { join } = require('path');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            botPerms: ['ATTACH_FILES'],
            aliases: ['deletethis'],
            guildOnly: true,

            cooldown: 30,

            usage: '<user:advuser>',
            description: "I'll hammer you anyway.",
            extend: {
                EXPLANATION: 'Excuse me, can you delete that post? Ok, let me get the hammer and pursue you.',
                ARGUMENTS: '<user>',
                EXP_USAGE: [
                    ['user', 'The user you wish to DELET THIS!']
                ],
                EXAMPLES: ['Skyra']
            }
        });

        this.template = null;
    }

    async run(msg, [user]) {
        const attachment = await this.generate(msg, user);
        return msg.channel.send({ files: [{ attachment, name: 'deletThis.png' }] });
    }

    async generate(msg, user) {
        let selectedUser;
        let hammerer;
        if (user.id === '242043489611808769' === msg.author.id) throw '💥';
        if (user === msg.author) [selectedUser, hammerer] = [msg.author, this.client.user];
        else if (['242043489611808769', '251484593859985411'].includes(user.id)) [selectedUser, hammerer] = [msg.author, user];
        else [selectedUser, hammerer] = [user, msg.author];

        const [Hammered, Hammerer] = await Promise.all([
            fetchAvatar(selectedUser, 256),
            fetchAvatar(hammerer, 256)
        ]);

        /* Initialize Canvas */
        return new Canvas(650, 471)
            .addImage(this.template, 0, 0, 650, 471)
            .rotate(0.4)
            .save()
            .addImage(Hammerer, 297, -77, 154, 154, { type: 'round', radius: 77 })
            .restore()
            .setTransform(1, 0, 0, 1, 0, 0)
            .rotate(0.46)
            .addImage(Hammered, 495, -77, 154, 154, { type: 'round', radius: 77 })
            .setTransform(1, 0, 0, 1, 0, 0)
            .toBufferAsync();
    }

    async init() {
        this.template = await readFile(join(__dirname, '../../assets/images/memes/DeletThis.png'));
    }

};
