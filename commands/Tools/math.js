const now = require("performance-now");
const math = require("mathjs");

exports.run = async (client, msg, [exp]) => {
  const start = now();
  try {
    const evaled = await math.eval(exp);
    await msg.send([`⚙ **Calculated** (${(now() - start).toFixed(3)}ms)${"```"}js`,
      `${client.funcs.clean(client, evaled)}${"```"}`].join("\n"));
  } catch (e) {
    msg.error(e);
  }
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
};

exports.help = {
  name: "math",
  description: "Calculate arbitrary maths.",
  usage: "<expresion:str>",
  usageDelim: "",
  extendedHelp: [
    "Take a look in http://mathjs.org/docs/index.html#documentation",
    "",
    " ❯ Expresion :: The formula you want to calculate.",
    "",
    "This command supports matrices, complex numbers, fractions, big numbers, and even, algebra.",
  ].join("\n"),
};
