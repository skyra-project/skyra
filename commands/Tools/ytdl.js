const { promisify } = require("util");
const { sep } = require("path");
const constants = require("../../utils/constants");
const ytdl = require("ytdl-core");
const fs = require("fs-nextra");

const getInfoAsync = promisify(ytdl.getInfo);

const { google } = constants.getConfig.tokens;

/* eslint-disable no-useless-escape */
exports.download = (url, typeFormat, dir, filename) => new Promise((resolve, reject) => {
  ytdl(url, { filter(format) { return format.container === typeFormat; } })
    .pipe(fs.createWriteStream(`${dir}${filename}`))
    .on("error", err => reject(err))
    .on("finish", () => resolve());
});

exports.run = async (client, msg, [input]) => {
  const data = await client.funcs.fetch.JSON(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(input)}&key=${google}`);
  const result = data.items[0];
  if (!result) throw constants.httpResponses(404);
  const url = result.id.kind === "youtube#channel" ? `https://youtube.com/channel/${result.id.channelId}` : `https://youtu.be/${result.id.videoId}`;
  const dir = `${client.clientBaseDir}downloads${sep}`;

  const info = await getInfoAsync(url);
  const filename = `${info.title.replace(/[^a-zA-Z0-9\[\]()\-\. ]/g, "").replace(/[ ]{2}/g, " ")}`;
  const files = await fs.readdir(dir).catch(() => fs.mkdir(dir).then(() => []));
  if (files.includes(`${filename}.mp3`)) throw "this song was already downloaded.";
  await msg.send(`Downloading \`${filename}\``);
  await this.download(url, "webm", dir, `${filename}.webm`);
  return msg.send("🗄 | Downloaded.");
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
  usage: "<query:string>",
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
