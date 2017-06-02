const { JSON: fetchJSON } = require("../../utils/kyraFetch");
const constants = require("../../utils/constants");

/* Autentification */
const { blizzard } = constants.getConfig.tokens;

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
  const url = `https://${server.toLowerCase()}.api.battle.net/wow/character/${encodeURIComponent(realm)}/${encodeURIComponent(character)}?fields=stats&apikey=${blizzard}`;
  try {
    msg.channel.startTyping();
    const { data } = await fetchJSON(url);

    const embed = new client.methods.Embed()
      .setTitle(`**World of Warcraft Stats:** *${data.name}*`)
      .setColor(0x04AB41)
      .setDescription([
        `Level: **${data.level}**`,
        `${data.totalHonorableKills ? `**${data.totalHonorableKills}** honorable kills.` : "No honorable kills."}`,
        `Realm: **${data.realm}**${data.battlegroup !== "" ? `; battlegroup: **${data.battlegroup}**.` : "."}`,
        "\u200B",
      ].join("\n"))
      .setFooter("📊 Statistics")
      .setThumbnail("https://us.battle.net/forums/static/images/game-logos/game-logo-wow.png")
      .setTimestamp()
      .addField(`❯ ${data.name} ${genders[data.gender]}`, [
        `Level: **${data.level}**.`,
        `Character stats: **${data.stats.health}** health and **${data.stats.armor}** armor.`,
        `Class: **${classes[data.class]}**.`,
        `Race: **${races[data.race] ? races[data.race] : data.race}**.`,
        `Power type: **${data.stats.powerType}**.`,
        "",
        `Total achievement points: **${data.achievementPoints}**.`,
      ].join("\n"), true);

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
