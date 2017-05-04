exports.run = async (client, msg, [input, ind = 1]) => {
  const index = ind - 1;
  try {
    const cfg = client.constants.config;
    const res = await client.wrappers.requestJSON(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(input)}&key=${cfg.GoogleAPIKey}`);
    const result = res.items[index];
    if (!result) throw new Error(client.constants.httpResponses(404));
    const output = result.id.kind === "youtube#channel" ? `https://youtube.com/channel/${result.id.channelId}` : `https://youtu.be/${result.id.videoId}`;
    await msg.send(output);
  } catch (e) {
    msg.error(e);
  }
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
};

exports.help = {
  name: "youtube",
  description: "Search something throught YouTube.",
  usage: "<query:str> [index:int]",
  usageDelim: " #",
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
