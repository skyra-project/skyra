exports.run = async (client, msg, [string]) => {
  try {
    await msg.send([
      `Dear ${msg.author}, the reverse for your string is:`,
      `${"```"}${string.split("").reverse().join("")}${"```"}`,
    ].join("\n"));
  } catch (e) {
    msg.error(e);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: true,
  mode: 0,
};

exports.help = {
  name: "reverse",
  description: "Reverse your phrases",
  usage: "<text:str>",
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
