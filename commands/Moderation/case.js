const ModLog = require("../../utils/createModlog.js");

exports.run = async (client, msg, [index]) => {
    const cases = await msg.guild.settings.moderation.getCases();

    if (!cases[index]) throw "this case does not seem to exist.";
    return new ModLog(msg.guild)
        .retrieveModLog(index).then(embed => msg.send({ embed }));
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: [],
    permLevel: 2,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 2,
    cooldown: 5,
};

exports.help = {
    name: "case",
    description: "Get the information from a case by its index.",
    usage: "<Case:int>",
    usageDelim: " ",
};
