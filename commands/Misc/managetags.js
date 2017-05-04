const sqlite = require("sqlite");

exports.run = async (client, msg, [arg, name, ...tag]) => {
  const thisTag = tag.join(" ");
  const tagDB = await sqlite.open("tags.sqlite");
  if (arg.toUpperCase() === "ADD") {
    if (!tag[0]) return msg.send(`Dear ${msg.author}, you must specify a tag name.`);
    if (client.tags.get(name.toUpperCase())) return msg.channel.send(`Dear ${msg.author}, this tag already exists.`);
    try {
      await tagDB.run("INSERT INTO tags (name, contents) VALUES (?, ?)", [`${name.toUpperCase()}`, `${thisTag}`]);
      client.tags.set(name.toUpperCase(), {
        name: name.toUpperCase(),
        contents: thisTag,
      });
      msg.send(`The tag **${name}** has been created.`);
    } catch (e) {
      msg.error(e);
    }
  } else {
    if (!client.tags.get(name.toUpperCase())) return msg.channel.send(`Dear ${msg.author}, this tag doesn't exist.`);
    try {
      await tagDB.run(`DELETE FROM tags WHERE name = '${name.toUpperCase()}'`);
      client.tags.delete(name.toUpperCase());
      await msg.send(`The tag **${name}** has been nuked.`);
    } catch (e) {
      msg.error(e);
    }
  }
  return true;
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["tagmanager"],
  permLevel: 10,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
};

exports.help = {
  name: "managetags",
  description: "Check all available tags.",
  usage: "<add|remove> <name:str> [value:str]",
  usageDelim: " ",
  extendedHelp: "",
};
