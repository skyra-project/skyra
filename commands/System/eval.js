/* eslint-disable */
const fs = require("fs-extra-promise");
const moment = require("moment");
const util = require("util");
const now = require("performance-now");

const { Console } = require("console");
const output = fs.createWriteStream("./stdout.log");
const errorOutput = fs.createWriteStream("./stderr.log");
const logger = new Console(output, errorOutput).log;
/* eslint-enable */

/* eslint-disable no-eval */
exports.run = async (client, msg, [type = false, ...args]) => {
  const send = [];
  const start = now();
  args = args.join(" ");
  try {
    // EVAL
    const input = type ? `(async () => { ${args} })()` : args;
    const res = await eval(input);
    const time = now() - start;

    // INSPECT
    let out;
    if (typeof res === "object" && typeof res !== "string") {
      out = util.inspect(res, { depth: 0 });
      if (typeof out === "string" && out.length > 1900) out = res.toString();
    } else { out = res; }

    // SEND MESSAGE
    send.push(`➡ **Input:** Executed in ${time.toFixed(5)}ms${"```"}js`);
    send.push(`${args.replace(/```/g, "`\u200b``")}${"```"}`);
    send.push("🔍 **Inspect:**```js");
    send.push(`${client.funcs.clean(client, out)}${"```"}`);
  } catch (err) {
    send.push(`➡ **Input:** Executed in ${(now() - start).toFixed(5)}ms${"```"}js`);
    send.push(`${args.replace(/```/g, "`\u200b``")}${"```"}`);
    send.push("❌ **Error:**```js");
    send.push(`${(err.message || err)}${"```"}`);
  } finally {
    msg.send(send.join("\n")).catch(err => msg.error(err));
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["ev"],
  permLevel: 10,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
};

exports.help = {
  name: "eval",
  description: "Evaluates arbitrary Javascript. Not for the faint of heart.",
  usage: "[async] <expression:str> [...]",
  usageDelim: " ",
  extendedHelp: "",
};
