const Komada = require("./komada");
const cfg = require("./config.js");
require("./utils/skyra.js");

const Skyra = new Komada.Client({
  ownerID: cfg.ownerid,
  clientID: "251484593859985411",
  prefix: "&",
  cmdEditing: true,
  cmdLogging: true,
  userFriendlyRegExp: "((?:Hey )?Skyra(?:,|!) +)",
  dash: cfg.dash,
  clientOptions: {
    disabledEvents: [
      "TYPING_START",
      "RELATIONSHIP_ADD",
      "RELATIONSHIP_REMOVE",
      "CHANNEL_PINS_UPDATE",
    ],
  },
  permStructure: new Komada.PermLevels()
    .addLevel(0, false, () => true)
    .addLevel(1, false, (client, msg) => {
      if (!msg.guild) return false;
      if (msg.guild.configs && msg.guild.configs.roles.staff && msg.member.roles.has(msg.guild.configs.roles.staff)) return true;
      else if (msg.member.hasPermission("MANAGE_MESSAGES")) return true;
      return false;
    })
    .addLevel(2, false, (client, msg) => {
      if (!msg.guild) return false;
      if (msg.guild.configs && msg.guild.configs.roles.moderator && msg.member.roles.has(msg.guild.configs.roles.moderator)) return true;
      else if (msg.member.hasPermission("BAN_MEMBERS")) return true;
      return false;
    })
    .addLevel(3, false, (client, msg) => {
      if (!msg.guild) return false;
      if (msg.guild.configs && msg.guild.configs.roles.admin && msg.member.roles.has(msg.guild.configs.roles.admin)) return true;
      else if (msg.member.hasPermission("ADMINISTRATOR")) return true;
      return false;
    })
    .addLevel(4, false, (client, msg) => {
      if (!msg.guild) return false;
      return msg.author.id === msg.guild.owner.id;
    })
    .addLevel(9, true, (client, msg) => msg.author.id === client.config.ownerID)
    .addLevel(10, false, (client, msg) => msg.author.id === client.config.ownerID)
    .structure,
});

Skyra.login(cfg.tokens.bot.stable);
