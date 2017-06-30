exports.run = async (client, msg) => {
  const information = [
    "Komada is a 'plug-and-play' framework built on top of the Discord.js library.",
    "Most of the code is modularized, which allows developers to edit Komada to suit their needs.",
    "",
    "Some features of Komada include:",
    "• Fast Loading times with ES7 Support (Async/Await)",
    "• Per-server settings for each guild, that can be extended with your own code",
    "• Customizable Command system with automated usage parsing and easy to use reloading and downloading modules",
    "• \"Monitors\" which can watch messages and act on them, like a normal message event (Swear Filters, Spam Protection, etc)",
    "• \"Inhibitors\" which can prevent commands from running based on a set of parameters (Permissions, Blacklists, etc)",
    "• \"Providers\" which allow you to connect with an outside database of your choosing. Not yet documented.",
    "• \"Finalizers\" which run on messages after a successful command.",
    "• \"Extendables\", code that acts passively. They add properties or methods to existing Discord.js classes.",
    "• Internal \"Functions\" which allow you to use functions anywhere where you have access to a client variable.",
    "",
    "We hope to be a 100% customizable framework that can cater to all audiences. We do frequent updates and bugfixes when available.",
    "If you're interested in us, check us out at https://komada.js.org",
  ];
  return msg.sendMessage(information);
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["details", "what"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  requiredSettings: [],
};

exports.help = {
  name: "info",
  description: "Provides some information about this bot.",
  usage: "",
  usageDelim: "",
};
