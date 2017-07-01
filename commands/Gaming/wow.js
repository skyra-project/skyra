const { getConfig } = require("../../utils/constants");
const snekfetch = require("snekfetch");

/* Autentification */
const { blizzard } = getConfig.tokens;

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

const fetchURL = (server, realm, character) => snekfetch.get(`https://${server}.api.battle.net/wow/character/${realm}/${character}?fields=stats&apikey=${blizzard}`).then(d => JSON.parse(d.text));

exports.run = async (client, msg, [server, character, ...realm]) => {
    await msg.send("`Fetching data...`");
    const data = await fetchURL(server.toLowerCase(), encodeURIComponent(realm), encodeURIComponent(character));

    const embed = new client.methods.Embed()
    .setTitle(`**World of Warcraft Stats:** *${data.name}*`)
    .setColor(0x04AB41)
    .setDescription(
        `Level: **${data.level}**\n` +
        `${data.totalHonorableKills ? `**${data.totalHonorableKills}** honorable kills.` : "No honorable kills."}\n` +
        `Realm: **${data.realm}**${data.battlegroup !== "" ? `; battlegroup: **${data.battlegroup}**.` : "."}`,
    )
    .setFooter("📊 Statistics")
    .setThumbnail("https://us.battle.net/forums/static/images/game-logos/game-logo-wow.png")
    .setTimestamp()
    .addField(`❯ ${data.name} ${genders[data.gender]}`,
        `Level: **${data.level}**.\n` +
        `Character stats: **${data.stats.health}** health and **${data.stats.armor}** armor.\n` +
        `Class: **${classes[data.class]}**.\n` +
        `Race: **${races[data.race] ? races[data.race] : data.race}**.\n` +
        `Power type: **${data.stats.powerType}**.\n\n` +
        `Total achievement points: **${data.achievementPoints}**.`
    , true);

    return msg.send({ embed });
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
