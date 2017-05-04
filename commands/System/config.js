/* eslint-disable no-throw-literal */
class Validator {
  constructor(guild) {
    this.guild = guild;
    this.guildConfig = guild.configs;
    this.client = guild.client;
    this.validator = this.client.configValidation.find;
    this.validation = this.validator();
    this.config = this.guild.configs || this.client.configValidation.default();
  }

  get list() {
    const configs = this.config;
    return [
      "**❯ Channels**",
      ` • **Announcement:** ${configs.channels.announcement ? this.guild.channels.get(configs.channels.announcement) || configs.channels.announcement : "Not set"}`,
      ` • **Default:** ${configs.channels.default ? this.guild.channels.get(configs.channels.default) || configs.channels.default : "Not set"}`,
      ` • **Log:** ${configs.channels.log ? this.guild.channels.get(configs.channels.log) || configs.channels.log : "Not set"}`,
      ` • **MODLog:** ${configs.channels.mod ? this.guild.channels.get(configs.channels.mod) || configs.channels.mod : "Not set"}`,
      ` • **Spam:** ${configs.channels.spam ? this.guild.channels.get(configs.channels.spam) || configs.channels.spam : "Not set"}`,
      "",
      "**❯ Roles**",
      ` • **Admin:** ${configs.roles.admin ? this.guild.roles.get(configs.roles.admin) || configs.roles.admin : "Not set"}`,
      ` • **Moderator:** ${configs.roles.moderator ? this.guild.roles.get(configs.roles.moderator) || configs.roles.moderator : "Not set"}`,
      ` • **Staff:** ${configs.roles.staff ? this.guild.roles.get(configs.roles.staff) || configs.roles.staff : "Not set"}`,
      ` • **Muted:** ${configs.roles.muted ? this.guild.roles.get(configs.roles.muted) || configs.roles.muted : "Not set"}`,
      "",
      "**❯ Events**",
      ` • **channelCreate:** ${configs.events.channelCreate ? "Enabled" : "Disabled"}`,
      ` • **guildBanAdd:** ${configs.events.guildBanAdd ? "Enabled" : "Disabled"}`,
      ` • **guildBanRemove:** ${configs.events.guildBanRemove ? "Enabled" : "Disabled"}`,
      ` • **commands:** ${configs.events.commands ? "Enabled" : "Disabled"}`,
      ` • **guildMemberAdd:** ${configs.events.guildMemberAdd ? "Enabled" : "Disabled"}`,
      ` • **guildMemberRemove:** ${configs.events.guildMemberRemove ? "Enabled" : "Disabled"}`,
      ` • **guildMemberUpdate:** ${configs.events.guildMemberUpdate ? "Enabled" : "Disabled"}`,
      ` • **messageDelete:** ${configs.events.messageDelete ? "Enabled" : "Disabled"}`,
      ` • **messageDeleteBulk:** ${configs.events.messageDeleteBulk ? "Enabled" : "Disabled"}`,
      ` • **messageUpdate:** ${configs.events.messageUpdate ? "Enabled" : "Disabled"}`,
      ` • **roleUpdate:** ${configs.events.roleUpdate ? "Enabled" : "Disabled"}`,
      "",
      "**❯ Messages**",
      ` • **Farewell:** ${configs.events.sendMessage.farewell ? "Enabled" : "Disabled"}`,
      ` • **Greeting:** ${configs.events.sendMessage.greeting ? "Enabled" : "Disabled"}`,
      ` • **FarewellMessage:** ${configs.events.sendMessage.farewellMessage || "Not set"}`,
      ` • **GreetingMessage:** ${configs.events.sendMessage.greetingMessage || "Not set"}`,
      "",
      "**❯ Master**",
      ` • **Prefix:** ${configs.prefix || "&"}`,
      ` • **Mode:** ${configs.mode || 0}`,
      "",
      "**❯ SelfMOD**",
      ` • **Invite Links:** ${configs.selfmod.inviteLinks ? "Enabled" : "Disabled"}`,
      ` • **Ghost Mention:** ${configs.selfmod.ghostmention ? "Enabled" : "Disabled"}`,
    ].join("\n");
  }

  async handle(type, folder, subfolder, input) {
    if (type === "update") {
      const inputType = this.validation[folder][subfolder].type;
      if (!input) throw `You must provide a value type: ${inputType}`;
      const output = await this.update(folder, subfolder, input, inputType);
      await this.guildConfig.sync();
      return `Success. Changed value **${subfolder}** to **${output}**`;
    }

    const val = this.validation[folder][subfolder];
    const validation = this.validator(val.default)[folder][subfolder];
    await this.client.rethink.update("guilds", this.guild.id, validation.path);
    await this.guildConfig.sync();
    return `Success. Value **${subfolder}** has been reset to **${val.default}**`;
  }

  async update(folder, subfolder, input, inputType) {
    const parsed = await this.parse(inputType, input);
    const validator = this.validator(parsed.id || parsed)[folder][subfolder];
    await this.client.rethink.update("guilds", this.guild.id, validator.path);
    return parsed.name || parsed;
  }

  async parse(type, input) {
    switch (type) {
      case "Boolean": {
        if (/^(true|1|\+)$/.test(input)) return true;
        else if (/^(false|0|-)$/.test(input)) return false;
        throw "Expected Boolean. (true|1|+)/(false|0|-)";
      }
      case "String": {
        return input;
      }
      case "Role": {
        const role = await this.client.search.Role(input, this.guild);
        if (role) return role;
        throw "Expected Role.";
      }
      case "TextChannel": {
        const channel = await this.client.search.Channel(input, this.guild);
        if (channel) return channel;
        throw "Expected Channel.";
      }
      default:
        throw `Unknown Type: ${type}`;
    }
  }
}

exports.run = async (client, msg, [type, folder, subfolder, ...input]) => {
  input = input.join(" ");
  try {
    const run = new Validator(msg.guild);
    if (type === "list") {
      const data = run.list;
      const embed = new client.methods.Embed()
        .setColor(msg.color)
        .setTitle(`Configuration for: ${msg.guild.name}`)
        .setDescription(data)
        .setFooter("Skyra Configuration System")
        .setTimestamp();

      msg.sendEmbed(embed);
    } else {
      if (!folder) throw "Choose between Channels, Roles, Events, Messages, Master, Selfmod";
      const validation = client.configValidation.find();
      const possibilities = Object.keys(validation[folder]);
      if (!possibilities.includes(subfolder)) throw `Choose between one of the following: ${possibilities.join(", ")}`;
      const response = await run.handle(type, folder, subfolder, input);
      msg.alert(response || "Success!", 10000);
    }
  } catch (e) {
    msg.error(e);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 3,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
};

exports.help = {
  name: "config",
  description: "",
  usage: "<update|reset|list> [channels|roles|events|messages|master|selfmod] [key:str] [value:str] [...]",
  usageDelim: " ",
  extendedHelp: "",
};
