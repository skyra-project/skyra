const Canvas = require("canvas");

/* Color limiter */
const cL = c => Math.max(Math.min(c, 255), 0);

const sCL = (c) => {
  if (c > 110) return 0;
  return 255;
};

const showColor = async (client, color, diff) => {
  /* Initialize canvas */
  const c = new Canvas(370, 390);
  const ctx = c.getContext("2d");

  const red = color.r;
  const green = color.g;
  const blue = color.b;

  /* Load fonts */
  const NunitoSansExtraLight = new Canvas.Font("NunitoSansExtraLight", `${client.clientBaseDir}assets/fonts/NunitoSans-ExtraLight.ttf`); // eslint-disable-line no-unused-vars
  const FiraSans = new Canvas.Font("FiraSans", `${client.clientBaseDir}assets/fonts/FiraSans-Regular.ttf`); // eslint-disable-line no-unused-vars

  let thisLum;
  ctx.font = "18px FiraSans";
  const colours = [
    { R: red + (diff * 2), G: green, B: blue, pos: [5, 5] },
    { R: red + diff, G: green + diff, B: blue, pos: [5, 125] },
    { R: red, G: green + (diff * 2), B: blue, pos: [5, 245] },
    { R: red + diff, G: green, B: blue + diff, pos: [125, 5] },
    { R: red, G: green, B: blue, pos: [125, 125] },
    { R: red - diff, G: green, B: blue - diff, pos: [125, 245] },
    { R: red, G: green, B: blue + (diff * 2), pos: [245, 5] },
    { R: red - diff, G: green - diff, B: blue, pos: [245, 125] },
    { R: red - (diff * 2), G: green - (diff * 2), B: blue - (diff * 2), pos: [245, 245] },
  ];
  await Promise.all(colours.map(index => new Promise((res) => {
    ctx.fillStyle = `rgb(${cL(index.R)}, ${cL(index.G)}, ${cL(index.B)})`;
    ctx.fillRect(index.pos[0], index.pos[1], 120, 120);
    thisLum = client.ResolverColor.luminance(cL(index.R), cL(index.G), cL(index.B));
    ctx.fillStyle = `rgb(${sCL(thisLum)}, ${sCL(thisLum)}, ${sCL(thisLum)})`;
    ctx.fillText(client.ResolverColor.hexConcat(cL(index.R), cL(index.G), cL(index.B)), 10 + index.pos[0], 20 + index.pos[1]);
    res();
  })));

  /* Complementary */
  ctx.fillStyle = `rgb(${255 - red}, ${255 - green}, ${255 - blue})`;
  ctx.fillRect(5, 365, 360, 20);
  thisLum = client.ResolverColor.luminance(255 - red, 255 - green, 255 - blue);
  ctx.font = "16px FiraSans";
  ctx.fillStyle = `rgb(${sCL(thisLum)}, ${sCL(thisLum)}, ${sCL(thisLum)})`;
  ctx.fillText(client.ResolverColor.hexConcat(255 - red, 255 - green, 255 - blue), 15, 22 + 360);

  return c.toBuffer();
};

exports.run = async (client, msg, [input, diff = 10]) => {
  const color = client.ResolverColor.validate(input);
  const hex = color.hex;
  const hsl = color.hsl;

  const hsluv = client.ResolverColor.hex2hsluv(hex.r, hex.g, hex.b);

  const output = await showColor(client, color.rgb, diff);
  await msg.channel.sendFile(output, "color.png", [
    `Color: **#${hex.r}${hex.g}${hex.b}**`,
    `RGB: ${color.rgb.parsed}`,
    `HSL: hsl(${hsl.h}, ${hsl.s}, ${hsl.l})`,
    `HSLᵤᵥ: hsluv(${hsluv.h}, ${hsluv.s}, ${hsluv.l})`,
  ].join("\n"));
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["colour"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 1,
  cooldown: 10,
};

exports.help = {
  name: "color",
  description: "Display some awesome colours.",
  usage: "<color:str> [separator:int{0,255}]",
  usageDelim: " >",
  extendedHelp: [
    "Hey! Do you want me to display a color?",
    "",
    "Usage:",
    "&color <Color>",
    "",
    " ❯ Color: Hex code of the color you want displayed",
    "",
    "Examples:",
    "&color ff73c1",
    "❯❯ I display a lot of info from this color.",
  ].join("\n")
  ,
};
