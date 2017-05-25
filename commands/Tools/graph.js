const Canvas = require("canvas");
const math = require("mathjs");

const Graph = (values) => {
  const c = new Canvas(400, 400);
  const ctx = c.getContext("2d");

  ctx.fillStyle = "rgb(255, 255, 255)";
  ctx.fillRect(0, 0, 400, 400);

  ctx.strokeStyle = "rgb(200, 200, 200)";
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    ctx.moveTo(0, i * (400 / 10));
    ctx.lineTo(400, i * (400 / 10));
  }
  ctx.stroke();
  ctx.closePath();

  ctx.strokeStyle = "rgb(0, 0, 0)";
  ctx.beginPath();
  ctx.moveTo(0, 200);
  ctx.lineTo(400, 200);
  ctx.stroke();
  ctx.closePath();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgb(255, 0, 0)";
  ctx.beginPath();
  ctx.moveTo(0, values[0] + 200);
  for (let i = 0; i <= 400; i++) ctx.lineTo(i, (values[i] * 4) + 200);
  ctx.stroke();
  ctx.closePath();

  return c.toBuffer();
};

exports.run = async (client, msg, [exp]) => {
  const values = [];
  for (let i = 0; i <= 400; i++) values.push(math.eval(`x=${i / 4};${exp}`).entries[0]);
  const max = values.reduce((a, b) => Math.max(a, b));
  const min = values.reduce((a, b) => Math.min(a, b));

  const file = Graph(values);

  await msg.send(`Min value is ${min}, max is ${max}`, { files: [{ attachment: file }] });
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 1,
  cooldown: 60,
};

exports.help = {
  name: "graph",
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
