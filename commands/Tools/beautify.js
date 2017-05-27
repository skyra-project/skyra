const { js_beautify } = require("js-beautify");

const reduceIndentation = (string) => {
  let whitespace = string.match(/^(\s+)/);
  if (!whitespace) return string;

  whitespace = whitespace[0].replace("\n", "");
  return string.split("\n").map(line => line.replace(whitespace, "")).join("\n");
};

const format = async (msg) => {
  const messages = msg.channel.messages.array().reverse();
  let code;
  const codeRegex = /```(?:js|json|javascript)?\n?((?:\n|.)+?)\n?```/ig;

  for (let m = 0; m < messages.length; m++) {
    const message = messages[m];
    const groups = codeRegex.exec(message.content);

    if (groups && groups[1].length) {
      code = groups[1];
      break;
    }
  }
  if (!code) throw new Error("No Javascript codeblock found.");

  const beautifiedCode = js_beautify(code, { indent_size: 2, brace_style: "collapse", jslint_happy: true });
  const str = await reduceIndentation(beautifiedCode);
  return (`${"```js"}\n${str}\n${"```"}`);
};

exports.run = async (client, msg) => {
  await msg.send("Searching for code to beautify...");
  const res = await format(msg);
  await msg.send(res);
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
  cooldown: 30,
};

exports.help = {
  name: "beautify",
  description: "Beautify your code.",
  usage: "",
  usageDelim: "",
  extendedHelp: [
    "Hey! Do you want me to beautify some of your code?",
    "Keep in mind this is a JAVASCRIPT beautifier, but it also works for anything.",
    "",
    "Usage:",
    "&beautify <Code>",
    "",
    " ❯ Code: Code you want beautified",
    "",
    "Examples:",
    "&beautify code",
    "❯❯ Beautified code",
  ].join("\n"),
};
