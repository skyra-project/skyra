/* eslint-disable no-throw-literal, complexity, no-use-before-define */
class Settings {
  constructor(msg) {
    Object.defineProperty(this, "msg", { value: msg });
    Object.defineProperty(this, "guild", { value: msg.guild });
    Object.defineProperty(this, "configs", { value: msg.guild.configs });
    Object.defineProperty(this, "client", { value: msg.client });
  }

  async parse(key, value) {
    const type = validator[key].type;
    switch (type) {
      case "String": return value;
      case "Role": {
        const role = await this.client.search.Role(value, this.guild);
        if (role) return role;
        throw "Expected Role.";
      }
      case "Command": {
        const commands = this.client.commands.filter(cmd => cmd.conf.permLevel < 10);
        if (commands.has(value)) return value;
        throw "Command not found.";
      }
      default:
        throw `Unknown Type: ${type}`;
    }
  }

  async handle(type, key, value) {
    switch (type) {
      case "add": {
        if (!value) throw "You must assign a value to add.";
        const nValue = await this.parse(key, value);
        const { path } = validator[key];
        await this.client.rethink.append("guilds", this.guild.id, path, nValue.id || nValue);
        return `Successfully added the value ${nValue.name || nValue} to the key ${key}`;
      }
      case "remove": {
        if (!value) throw "You must assign a value to add.";
        return this;
      }
      default:
        throw `Unknown Type: ${type}`;
    }
  }
}

exports.run = async (client, msg, [type, key, value = null]) => {
  const settings = new Settings(msg);
  await settings.handle(type, key, value);
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 3,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 1,
};

exports.help = {
  name: "setting",
  description: "Beautify your code.",
  usage: "<add|remove> <autoroles|commands|publicroles|wordfilter> [value:str]",
  usageDelim: " ",
  extendedHelp: [
    "Hey! Do you want me to beautify some of your code?",
    "Keep in mind this is a JAVASCRIPT beautifier, but it also works for anything.",
    "",
    "Usage:",
    "&beautify <Code>",
    "",
    " ❯ Code: Code you want beautified",
    "",
    "Examples:",
    "&beautify code",
    "❯❯ Beautified code",
  ].join("\n"),
};

const validator = {
  autoroles: {
    type: "Role",
    path: "autoroles",
  },
  commands: {
    type: "Command",
    path: "disabledCommands",
  },
  publicroles: {
    type: "Role",
    path: "publicRoles",
  },
  wordfilter: {
    type: "String",
    path: "profanity",
  },
};
