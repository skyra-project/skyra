const translator = require("google-translate-api");
const iso = require("iso-639-1");

exports.getISO = (x) => {
  x = x.toLowerCase();
  if (iso.getAllCodes().includes(x)) return x;
  return iso.getCode(x);
};

exports.verifyLanguage = (input) => {
  const to = this.getISO(input);
  if (!to.length) throw `${input} isn't a real language`;
  return iso.getName(to);
};

exports.getLanguages = (input) => {
  input = input.split("/");
  const from = this.verifyLanguage(input[0]);
  const to = input[1] ? this.verifyLanguage(input[1]) : null;
  const output = { from };
  if (to) output.to = to;
  return output;
};

exports.run = async (client, msg, [lang, ...input]) => {
  const options = this.getLanguages(lang);
  const res = await translator(input.join(" "), options);
  await msg.send([
    `Dear ${msg.author}, the translation for *${input.join(" ")}* **[${res.from.language.iso.toUpperCase()}]** to **[${options.to.toUpperCase()}]** is:${"```"}`,
    `${res.text}${"```"}`,
  ].join("\n"));
};

exports.conf = {
  enabled: false,
  runIn: ["text", "dm", "group"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 1,
  cooldown: 15,
};

exports.help = {
  name: "translate",
  description: "Eeny, meeny, miny, moe, catch a tiger by the toe...",
  usage: "<language:string> <input:string> [...]",
  usageDelim: " ",
  extendedHelp: "",
};
