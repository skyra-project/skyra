const { superRegExp } = require("../../utils/guildSettings");

exports.run = async (client, msg, [action, ...input]) => {
    const word = input.length ? input.join(" ") : null;
    const settings = msg.guild.settings;
    switch (action) {
        case "add":
            if (word === null) throw "you must write what do you want me to filter.";
            if (settings.filter.raw.includes(word)) throw "this word is already filtered.";
            settings.filter.raw.push(word);
            settings.filter.regexp = superRegExp(settings.filter.raw);
            await settings.update({ filter: { raw: settings.filter.raw } });
            return msg.send(`| ✅ | Success! Added the word ${word} to the filter.`);
        case "remove":
            if (word === null) throw "you must write what do you want me to filter.";
            if (!settings.filter.raw.includes(word)) throw "this word is not filtered.";
            settings.filter.raw = settings.filter.raw.filter(w => w !== word);
            settings.filter.regexp = superRegExp(settings.filter.raw);
            await settings.update({ filter: { raw: settings.filter.raw } });
            return msg.send(`| ✅ | Success! Removed the word ${word} from the filter.`);
        case "reset":
            settings.filter.raw = [];
            settings.filter.regexp = null;
            await settings.update({ filter: { raw: [] } });
            return msg.send("| ✅ | Success! The filter has been reset.");
        default:
            return msg.send("| ❌ | Error! Unknown action.");
    }
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: [],
    permLevel: 1,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 2,
    cooldown: 5,
};

exports.help = {
    name: "filter",
    description: "Check the meaning of a word or a phrase.",
    usage: "<add|remove|reset> [word:string] [...]",
    usageDelim: " ",
    extendedHelp: "",
};
