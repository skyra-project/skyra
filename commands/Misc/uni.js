/* eslint-disable object-property-newline */
const dict = {
  a: "ａ", b: "ｂ", c: "ｃ", d: "ｄ",
  e: "ｅ", f: "ｆ", g: "ｇ", h: "ｈ",
  i: "ｉ", j: "ｊ", k: "ｋ", l: "ｌ",
  m: "ｍ", n: "ｎ", o: "ｏ", p: "ｐ",
  q: "ｑ", r: "ｒ", s: "ｓ", t: "ｔ",
  u: "ｕ", v: "ｖ", w: "ｗ", x: "ｘ",
  y: "ｙ", z: "ｚ",
  A: "Ａ", B: "Ｂ", C: "Ｃ", D: "Ｄ",
  E: "Ｅ", F: "Ｆ", G: "Ｇ", H: "Ｈ",
  I: "Ｉ", J: "Ｊ", K: "Ｋ", L: "Ｌ",
  M: "Ｍ", N: "Ｎ", O: "Ｏ", P: "Ｐ",
  Q: "Ｑ", R: "Ｒ", S: "Ｓ", T: "Ｔ",
  U: "Ｕ", V: "Ｖ", W: "Ｗ", X: "Ｘ",
  Y: "Ｙ", Z: "Ｚ",
  0: "０", 1: "１", 2: "２", 3: "３",
  4: "４", 5: "５", 6: "６", 7: "７",
  8: "８", 9: "９",
  ",": "，", ".": "．",
  ":": "：", ";": "；",
  "!": "！", "?": "？",
  "'": "＇", "`": "｀",
  "^": "＾", "~": "～",
  "&": "＆", "@": "＠",
  "#": "＃", "%": "％",
  "+": "＋", "-": "－",
  "*": "＊", "=": "＝",
  "<": "＜", ">": "＞",
  "(": "（", ")": "）",
  "[": "［", "]": "］",
  "{": "｛", "}": "｝",
  "¯": "￣",
  "\u0020": "　",
  "\"": "＂",
  _: "＿",
};

exports.run = async (client, msg, [params]) => {
  let out = "";
  for (const char of params) if (dict[char]) out += dict[char]; // eslint-disable-line no-restricted-syntax
  return msg.send(out).catch(() => msg.send(`Dear ${msg.author}, no characters could be converted.`));
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["unicode"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: true,
  mode: 0,
  cooldown: 30,
};

exports.help = {
  name: "uni",
  description: "Generate a large unicode message with the message you have written.",
  usage: "<input:str>",
  usageDelim: "",
  extendedHelp: [
    "Hey! Somebody told me that people like aesthetic phrases, so I made something.",
    "",
    "Examples:",
    "",
    "&uni Hello world",
    "❯❯ \" Ｈｅｌｌｏ　ｗｏｒｌｄ \"",
    "&uni I AM COOL!",
    "❯❯ \" Ｉ　ＡＭ　ＣＯＯＬ！ \"",
  ].join("\n"),
};
