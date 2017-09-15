const { Command, colorUtil } = require('../../index');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            botPerms: ['EMBED_LINKS'],
            aliases: ['setcolour'],
            mode: 1,
            spam: true,
            cooldown: 10,

            usage: '<color:string>',
            description: "Change your userprofile's colour.",
            extendedHelp: Command.strip`
                I dislike the default fuschia colour!

                ⚙ | ***Explained usage***
                Skyra, setcolor [color]
                Color :: A Colour resolvable

                = Formats =
                    • HEX :: #dfdfdf
                    • RGB :: rgb(200, 200, 200)
                    • HSL :: hsl(350, 100, 100)
                    • B10 :: 14671839
            `
        });
    }

    async run(msg, [input], settings, i18n) {
        const { hex, b10 } = colorUtil.parse(input);
        const color = hex.toString().slice(1);
        await msg.author.profile.update({ color });

        const embed = new MessageEmbed()
            .setColor(b10.value)
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ size: 128 }))
            .setDescription(i18n.get('COMMAND_SETCOLOR', hex));

        return msg.send({ embed });
    }

};
