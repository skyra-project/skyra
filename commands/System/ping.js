exports.run = async (client, msg) => msg.send("Ping?")
    .then(m => m.edit(`Pong! (Roundtrip took: ${m.createdTimestamp - msg.createdTimestamp}ms. Heartbeat: ${Math.round(client.ping)}ms.)`));

exports.conf = {
    enabled: true,
    runIn: ["text", "dm", "group"],
    aliases: [],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    requiredSettings: [],
};

exports.help = {
    name: "ping",
    description: "Ping/Pong command. I wonder what this does? /sarcasm",
    usage: "",
    usageDelim: "",
};
