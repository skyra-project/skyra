const translator = require("google-translate-api");
const iso = require("iso-639-1");

class Translate {
  constructor() {
    Object.defineProperty(this, "getLanguages", { value: Translate.getLanguages });
  }

  static getISO(x) {
    x = x.toLowerCase();
    if (iso.getAllCodes().includes(x)) return x;
    return iso.getCode(x);
  }

  static verifyLanguage(input) {
    return new Promise((resolve, reject) => {
      const to = Translate.getISO(input);
      if (!to.length) reject(`${input} isn't a real language`);
      resolve(iso.getName(to));
    });
  }

  static getLanguages(input) {
    return new Promise((resolve, reject) => {
      input = input.split("/");
      const from = Translate.verifyLanguage(input[0]).catch(reject);
      const to = input[1] ? Translate.verifyLanguage(input[1]).catch(reject) : null;
      const output = { from };
      if (to) output.to = to;
      resolve(output);
    });
  }
}

exports.run = async (client, msg, [lang, ...input]) => {
  const translate = new Translate();
  const options = await translate.getLanguages(lang);

  const res = await translator(input.join(" "), options);
  await msg.send([
    `Dear ${msg.author}, the translation for *${input.join(" ")}* **[${res.from.language.iso.toUpperCase()}]** to **[${options.to.toUpperCase()}]** is:\`\`\``,
    res.text,
    "```",
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
