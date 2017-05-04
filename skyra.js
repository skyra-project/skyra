const Komada = require("./komada");
const cfg = require("./config.js");
require("./utils/skyra.js");

const Skyra = new Komada({
  ownerID: cfg.ownerid,
  clientID: "251484593859985411",
  prefix: "&",
  cmdEditing: true,
  cmdLogging: true,
  userFriendlyRegExp: "((?:Hey )?Skyra(?:,|!) +)",
  clientOptions: {
    disabledEvents: [
      "TYPING_START",
      "RELATIONSHIP_ADD",
      "RELATIONSHIP_REMOVE",
      "CHANNEL_PINS_UPDATE",
      "VOICE_STATE_UPDATE",
    ],
  },
  permStructure: [
    {
      check: () => true,
      break: false,
    },
    {
      check: (client, msg) => {
        if (!msg.guild) return false;
        if (msg.guild.configs && msg.guild.configs.roles.staff && msg.member.roles.has(msg.guild.configs.roles.staff)) return true;
        else if (msg.member.hasPermission("MANAGE_MESSAGES")) return true;
        return false;
      },
      break: false,
    },
    {
      check: (client, msg) => {
        if (!msg.guild) return false;
        if (msg.guild.configs && msg.guild.configs.roles.moderator && msg.member.roles.has(msg.guild.configs.roles.moderator)) return true;
        else if (msg.member.hasPermission("BAN_MEMBERS")) return true;
        return false;
      },
      break: false,
    },
    {
      check: (client, msg) => {
        if (!msg.guild) return false;
        if (msg.guild.configs && msg.guild.configs.roles.admin && msg.member.roles.has(msg.guild.configs.roles.admin)) return true;
        else if (msg.member.hasPermission("ADMINISTRATOR")) return true;
        return false;
      },
      break: false,
    },
    {
      check: (client, msg) => {
        if (!msg.guild) return false;
        if (msg.author.id === msg.guild.owner.id) return true;
        return false;
      },
      break: false,
    },
    {
      check: () => false,
      break: false,
    },
    {
      check: () => false,
      break: false,
    },
    {
      check: () => false,
      break: false,
    },
    {
      check: () => false,
      break: false,
    },
    {
      check: (client, msg) => {
        if (msg.author.id === client.config.ownerID) return true;
        return false;
      },
      break: true,
    },
    {
      check: (client, msg) => {
        if (msg.author.id === client.config.ownerID) return true;
        return false;
      },
      break: false,
    },
  ],
});

Skyra.login(cfg.token);
