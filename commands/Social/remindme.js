const { timer } = require("../../functions/wrappers");

exports.run = async (client, msg, [raw]) => {
    const input = /^(.+)\sin\s(.+)$/.exec(raw);
    if (!input) throw "You must tell me what do you want me to remind you and when.";

    const addtime = timer(input[2].split(" "));
    if (addtime < 60000) throw "Your reminder must be at least one minute long";
    const snowflake = await client.clock.create({
        type: "reminder",
        timestamp: addtime + new Date().getTime(),
        user: msg.author.id,
        content: input[1],
    }).catch((err) => { throw err; });

    return msg.send(`Dear ${msg.author}, a reminder with ID \`${snowflake}\` has been created.`);
};


exports.conf = {
    enabled: true,
    runIn: ["text", "dm", "group"],
    aliases: ["remind", "reminder"],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 2,
    cooldown: 60,
};

exports.help = {
    name: "remindme",
    description: "Add reminders.",
    usage: "<input:string>",
    usageDelim: "",
    extendedHelp: [
        "Ooh, reminders.",
        "",
        "= Usage =",
        "Skyra, remindme <text> in <time>",
        "",
        "= Arguments =",
        "text :: The text you want me to remind you.",
        "time :: When do you want me to remind you",
        "",
        "= Examples =",
        "Skyra, remindme To get dailies in 12h",
        "❯❯ I'll set a reminder with text 'To get dailies' and the reminder will be sent in '12h'.",
        "",
        "= Advice =",
        "The number and the unit must be written together at the moment, and if you do not specify the unit, it'll take milliseconds by default.",
    ].join("\n"),
};
