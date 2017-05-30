const { JSON: fetchJSON } = require("../../utils/kyraFetch");
const { promisifyAll } = require("tsubaki");
const { sep } = require("path");

const constants = require("../../utils/constants");
const ytdl = promisifyAll(require("ytdl-core"));
const fs = promisifyAll(require("fs"));

/* eslint-disable no-useless-escape, no-throw-literal */
exports.download = (url, typeFormat, dir, filename) => new Promise((resolve, reject) => {
  ytdl(url, { filter(format) { return format.container === typeFormat; } })
    .pipe(fs.createWriteStream(`${dir}${filename}`))
    .on("error", err => reject(err))
    .on("finish", () => resolve());
});

exports.run = async (client, msg, [input]) => {
  const { google } = constants.getConfig.tokens;
  const { data } = await fetchJSON(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(input)}&key=${google}`);
  const result = data.items[0];
  if (!result) throw constants.httpResponses(404);
  const url = result.id.kind === "youtube#channel" ? `https://youtube.com/channel/${result.id.channelId}` : `https://youtu.be/${result.id.videoId}`;
  const dir = `${client.clientBaseDir}downloads${sep}`;

  const info = await ytdl.getInfoAsync(url);
  const filename = `${info.title.replace(/[^a-zA-Z0-9\[\]()\-\. ]/g, "").replace(/[ ]{2}/g, " ")}`;
  const files = await fs.readdirAsync(dir).catch(() => fs.mkdirAsync(dir).then(() => []));
  if (files.includes(`${filename}.mp3`)) throw "This song was already downloaded.";
  await msg.send(`Downloading \`${filename}\``);
  await this.download(url, "webm", dir, `${filename}.webm`);
  await msg.send("🗄 | Downloaded.");
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: [],
  permLevel: 10,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 1,
};

exports.help = {
  name: "ytdl",
  description: "Search something throught YouTube.",
  usage: "<query:str>",
  usageDelim: "",
  extendedHelp: [
    "Let's search some videos :p",
    "",
    "Usage:",
    "&youtube <query>",
    "",
    " ❯ Query: Search videos with keywords.",
    "",
    "Examples:",
    "&youtube Arc North - Never Gonna",
  ].join("\n"),
};
