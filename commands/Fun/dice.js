const roll = (rolls, sides) => {
  let Total = 0;
  for (let i = 0; i < rolls; i++) {
    const x = Math.floor(Math.random() * (sides + 1));
    Total += x;
  }
  return Total;
};

exports.run = async (client, msg, [rl = 1, sd = 6]) => {
  await msg.send(`Dear ${msg.author}, you rolled the **${sd}**-dice **${rl}** times, you got: **${roll(rl, sd)}**`);
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
  cooldown: 10,
};

exports.help = {
  name: "dice",
  description: "Roll the dice, 'x' rolls and 'y' sides.",
  usage: "[rolls:int{1,1024}] [sides:int{4,1024}]",
  usageDelim: " ",
  extendedHelp: [
    "The Dice: a misterious Dice for misterious people.",
    "",
    "How do you use it? It's simple, you roll the dice with 'x' sides, 'y' times",
    "",
    "Examples:",
    "&dice 370 24",
    "❯❯ 4412",
    "&dice 100 6",
    "❯❯ 354",
    "&dice 200 4",
    "❯❯ 497",
  ].join("\n"),
};
