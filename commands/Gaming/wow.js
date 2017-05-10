const classes = {
  0: "None",
  1: "Warrior",
  2: "Paladin",
  3: "Hunter",
  4: "Rogue",
  5: "Priest",
  6: "DeathKnight",
  7: "Shaman",
  8: "Mage",
  9: "Warlock",
  10: "Monk",
  11: "Druid",
};

const races = {
  1: "Human",
  2: "Orc",
  3: "Dwarf",
  4: "Night elf",
  5: "Undead",
  6: "Tauren",
  7: "Gnome",
  8: "Troll",
  9: "Goblin",
  10: "Blood elf",
  11: "Draenei",
};

const genders = {
  0: "(gender unknown)",
  1: "♂",
  2: "♀",
};

exports.run = async (client, msg, [server, character, ...realm]) => {
  const cfg = client.constants.config;
  const url = `https://${server.toLowerCase()}.api.battle.net/wow/character/${encodeURIComponent(realm)}/${encodeURIComponent(character)}?fields=stats&apikey=${cfg.bliztoken}`;
  try {
    msg.channel.startTyping();
    const res = await client.wrappers.requestJSON(url);

    const embed = new client.methods.Embed()
      .setTitle(`**World of Warcraft Stats:** *${res.name}*`)
      .setColor(0x04AB41)
      .setDescription(client.indents`
        Level: **${res.level}**
        ${res.totalHonorableKills ? `**${res.totalHonorableKills}** honorable kills.` : "No honorable kills."}
        Realm: **${res.realm}**${res.battlegroup !== "" ? `; battlegroup: **${res.battlegroup}**.` : "."}
        \u200B
        `)
      .setFooter("📊 Statistics")
      .setThumbnail("https://us.battle.net/forums/static/images/game-logos/game-logo-wow.png")
      .setTimestamp()
      .addField(`❯ ${res.name} ${genders[res.gender]}`, client.indents`
        Level: **${res.level}**.
        Character stats: **${res.stats.health}** health and **${res.stats.armor}** armor.
        Class: **${classes[res.class]}**.
        Race: **${races[res.race] ? races[res.race] : res.race}**.
        Power type: **${res.stats.powerType}**.

        Total achievement points: **${res.achievementPoints}**.
        `, true);

    await msg.sendEmbed(embed);
  } catch (e) {
    msg.error(e);
  } finally {
    msg.channel.stopTyping(true);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["worldofwarcraft"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 1,
  cooldown: 30,
};

exports.help = {
  name: "wow",
  description: "Check your stats on World of Warcraft.",
  usage: "<us|eu|kr|tw> <character:string> <Realm:string> [...]",
  usageDelim: " ",
  extendedHelp: [
    "Witchs... orcs... knights... dragons... Who are YOU?",
    "",
    "Usage:",
    "&wow <server> <character> <realm>",
    "",
    " ❯ Server: choose between us, eu, kr or tw.",
    " ❯ Character: write your character's name.",
    " ❯ Realm: write the realm's name.",
    "",
    "Examples:",
    "&wow eu kyra Some Realm",
    "❯❯ I show you a lot of stuff from your account.",
  ].join("\n"),
};
