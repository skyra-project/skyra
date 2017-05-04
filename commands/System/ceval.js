/* eslint-disable */
const fs = require("fs");
const moment = require("moment");
const util = require("util");
const now = require("performance-now");

const Console = require("console").Console;
const output = fs.createWriteStream("./stdout.log");
const errorOutput = fs.createWriteStream("./stderr.log");
const logger = new Console(output, errorOutput).log;
/* eslint-enable */

/* eslint-disable no-eval */
exports.run = async (client, msg, [type, ...args]) => {
  args = args.join(" ");
  const start = now();
  try {
    // EVAL
    const input = type ? `(async () => { ${args} })()` : args;
    await eval(input);
  } catch (err) {
    msg.send(client.indents`
      ➡ **Input:** Executed in ${(now() - start).toFixed(5)}ms${"```"}js
      ${args.replace(/`/g, "\\`")}${"```"}
      ❌ **Error:**${"```"}js
      ${(err.message || err)}${"```"}
    `);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["cev"],
  permLevel: 10,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
};

exports.help = {
  name: "ceval",
  description: "Evaluates arbitrary Javascript. Not for the faint of heart.",
  usage: "[async] <expression:str> [...]",
  usageDelim: " ",
  extendedHelp: "",
};
