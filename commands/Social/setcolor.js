const { Command, Discord: { Embed } } = require("../../index");
const { validate: validateColor } = require("../../functions/resolveColor");

/* eslint-disable class-methods-use-this */
module.exports = class SetColor extends Command {

    constructor(...args) {
        super(...args, "setcolor", {
            botPerms: ["EMBED_LINKS"],
            aliases: ["setcolour"],
            mode: 1,
            spam: true,

            usage: "<color:string>",
            description: "Change your userprofile's colour.",
            extendedHelp: Command.strip`
                I dislike the default fuschia colour!

                = Usage =
                Skyra, setcolor [color]
                Color :: A Colour resolvable

                = Formats =
                    • HEX :: #dfdfdf
                    • RGB :: rgb(200, 200, 200)
                    • HSL :: hsl(350, 100, 100)
                    • B10 :: 14671839
            `,
        });
    }

    async run(msg, [input]) {
        const { hex, b10 } = validateColor(input);
        const color = hex.toString().slice(1);
        await msg.author.profile.update({ color });

        const embed = new Embed()
            .setColor(b10.value)
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ size: 128 }))
            .setDescription(`Colour changed to ${hex.toString()}`);
        return msg.send({ embed });
    }

};
