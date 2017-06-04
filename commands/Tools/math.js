const now = require("performance-now");
const math = require("mathjs");

exports.run = async (client, msg, [exp]) => {
  const start = now();
  const evaled = await math.eval(exp);
  return msg.send(`⚙ **Calculated** (${(now() - start).toFixed(3)}μs)${"```"}js${client.funcs.clean(client, evaled)}${"```"}`);
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["calculate", "calc"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 1,
  cooldown: 5,
};

exports.help = {
  name: "math",
  description: "Calculate arbitrary maths.",
  usage: "<expresion:str>",
  usageDelim: "",
  extendedHelp: [
    "Take a look in mathjs.org/docs/index.html#documentation",
    "",
    " ❯ Expresion :: The formula you want to calculate.",
    "",
    "This command supports matrices, complex numbers, fractions, big numbers, and even, algebra.",
  ].join("\n"),
};
