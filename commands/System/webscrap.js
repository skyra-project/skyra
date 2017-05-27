const himalaya = require("himalaya");
const snekfetch = require("snekfetch");
// const fsp = require("fs-extra-promise");

const { inspect } = require("util");

exports.run = async (client, msg, [url]) => {
  const out = {};

  const { text } = await snekfetch.get(url);
  himalaya.parse(text)[1]
    .children[1]
    .children.filter(obj => obj.tagName === "div")[1]
    .children.find(obj => obj.tagName === "div")
    .children[1] // 1 for Quickplay, 2 for Competitive
    .children[0] // Featured stats
    .children[0] // Get into the <div>
    .children.find(obj => obj.tagName === "ul") // Table of featured stats
    .children.map(o => o.children[0].children[1].children)
    .map(obj => [obj[1].children[0].content, obj[0].children[0].content])
    .forEach((o) => { out[o[0].replace(/[ -]/g, "")] = o[1]; });
  // await fsp.appendFileAsync(`${client.clientBaseDir}output.js`, inspect(out, { depth: null }));
  await msg.sendCode("js", inspect(out, { depth: null }));
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: [],
  permLevel: 10,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
};

exports.help = {
  name: "webscrap",
  description: "Evaluates arbitrary Javascript. Not for the faint of heart.",
  usage: "<url:url>",
  usageDelim: "",
  extendedHelp: "",
};
