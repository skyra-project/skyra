exports.run = async (client, msg, [string]) => msg.send(`Dear ${msg.author}, the reverse for your string is:${"```"}${string.split("").reverse().join("")}${"```"}`);

exports.conf = {
    enabled: true,
    runIn: ["text", "dm", "group"],
    aliases: [],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: true,
    mode: 0,
    cooldown: 30,
};

exports.help = {
    name: "reverse",
    description: "Reverse your phrases",
    usage: "<text:string>",
    usageDelim: "",
    extendedHelp: [
        "Usage:",
        "&reverse <string>",
        "",
        " ❯ String: The text you want to reverse.",
        "",
        "Examples:",
        "&reverse Hello",
        "❯❯ olleH",
        "&reverse This is a beautiful world",
        "❯❯ dlrow lufituaeb a si sihT",
    ].join("\n"),
};
