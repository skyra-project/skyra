const content = [
    "```Skyra Project started on 24th October 2016, you are currently using the version 1.7",
    "in which it's the seventh rewrite of the bot, this version is meant to insure code",
    "quality and extreme performance, as well as easy deployment.",
    "\n\nI have spent entire months working on this, and a lot of hours, I made sure Skyra",
    "can handle all kind of needings from any server where she is in, despite of making",
    "everything as a hobby (I really enjoy making Discord bots, I even work as a helper",
    "providing help for Discord.JS and the framework in which Skyra is built in: Komada).",
    "\n\nHowever, not everything is free, making a bot is, hosting it is not. That's why",
    "I need help to keep Skyra alive in the cloud 24/7, with very low response delay, and",
    "able to give all services and tools to all servers. My first goal is getting the",
    "VPS SSD1G from Virmach, in which is worth 7$/month, not counting taxes for international",
    "payments. Once I can afford that host, I'll be very happy, and I'll thank you a lot",
    "if you help me.\n\nI'm a 18 years old college student from Spain who enjoys coding",
    "a lot 😛, I have some neat projects coming soon, but Skyra is first priority!",
    "```If you want to donate, there's the link: paypal.me/kyranet",
].join(" ");

exports.run = async (client, msg) => msg.author.send(content)
  .then(() => { if (msg.guild) msg.send(`Dear ${msg.author}, I have send you the message in DMs.`); })
  .catch(() => msg.send(content));

exports.conf = {
    enabled: true,
    runIn: ["text", "dm", "group"],
    aliases: [],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 2,
};

exports.help = {
    name: "donate",
    description: "Support Skyra Project by donating.",
    usage: "",
    usageDelim: "",
    extendedHelp: content.replace("```", ""),
};
