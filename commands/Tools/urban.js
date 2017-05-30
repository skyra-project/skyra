exports.run = async (client, msg, [query, ind = 1]) => {
  const index = ind - 1;
  if (index < 0) throw new Error("Invalid index");
  const { data } = await client.fetch.JSON(`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`);
  const result = data.list[index];
  if (result === undefined) throw client.constants.httpResponses(404);
  const wdef = result.definition.length > 750 ?
    `${client.funcs.splitText(result.definition, 750)}...\nRead the full definition here: ${result.permalink}` :
    result.definition;
  const embed = new client.methods.Embed()
    .setTitle(`Word: ${client.funcs.toTitleCase(query)}`)
    .setURL(result.permalink)
    .setColor(msg.color)
    .setThumbnail("http://i.imgur.com/CcIZZsa.png")
    .setDescription([
      `**Definition:** ${ind} out of ${data.list.length}`,
      `_${wdef}_`,
      "\n**Example:**",
      result.example,
      `\n**Submitted by** ${result.author}`,
    ].join("\n"))
    .addField("\u200B", `\\👍 ${result.thumbs_up}`, true)
    .addField("\u200B", `\\👎 ${result.thumbs_down}`, true)
    .setFooter("© Urban Dictionary");

  await msg.sendEmbed(embed);
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["urbandictionary"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: ["splitText", "toTitleCase"],
  spam: false,
  mode: 1,
  cooldown: 15,
};

exports.help = {
  name: "urban",
  description: "Check the definition of a word on UrbanDictionary.",
  usage: "<query:str> [index:int]",
  usageDelim: " #",
  extendedHelp: [
    "What does \"Hello\" mean?",
    "",
    "Usage:",
    "&urban <query>",
    "",
    " ❯ Query: the word or phrase whose definition you want to get.",
    "",
    "Examples:",
    "&urban Hello",
  ].join("\n"),
};
