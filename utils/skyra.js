const Discord = require("discord.js");
const UserProfile = require("./userProfile.js");
const GuildConfigs = require("./guildConfig.js");
const Moderation = require("./moderation.js");
const MemberScore = require("./memberScore.js");
const Fetch = require("./kyraFetch.js");
const Constants = require("./constants.js");

const $ = (name) => { throw new Error(`${name} is a required argument.`); };

// const DMChannel = Discord.DMChannel;
// const TextChannel = Discord.TextChannel;
const Guild = Discord.Guild;
const Message = Discord.Message;
const GuildMember = Discord.GuildMember;
const User = Discord.User;
const Client = Discord.Client;

/* eslint-disable no-underscore-dangle */
class Skyra {

  get fetch() { // eslint-disable-line class-methods-use-this
    return Fetch;
  }

  get constants() { // eslint-disable-line class-methods-use-this
    return Constants;
  }

  get configs() {
    return new GuildConfigs(this);
  }

  get moderation() {
    return new Moderation(this);
  }

  get profile() {
    return new UserProfile(this);
  }

  get points() {
    return new MemberScore(this);
  }

  get color() {
    let color;
    if (this.client.cacheProfiles && this.client.cacheProfiles.has(this.author.id)) {
      color = parseInt(`0x${this.client.cacheProfiles.get(this.author.id).color}`);
    } else if (this.guild) {
      if (!this.member) this.guild.fetchMember(this.author.id);
      else color = this.member.highestRole.color;
    }
    return color || 14671839;
  }

  alert(content = $("Content"), timer = 10000) {
    if (!this.channel.postable) return null;
    return this.send(content).then(m => m.nuke(timer));
  }

  error(content = "", log = false) {
    if (log) this.client.emit("error", content);
    return this.alert(`|\`❌\`| **ERROR**:\n${"```"}js\n${content}${"```"}`);
  }

  nuke(time = 0) {
    if (this.timer) clearTimeout(this.timer);
    const count = this._edits.length;
    this.timer = setTimeout(() => {
      const msg = this.channel.messages.get(this.id);
      if (msg && msg._edits.length === count) this.delete();
    }, time);
  }

  async prompt(content, options) {
    if (!options && typeof content === "object" && !(content instanceof Array)) {
      options = content;
      content = "";
    } else if (!options) {
      options = {};
    }

    const message = await this.send(content, options);
    if (this.channel.permissionsFor(this.guild.me).has("ADD_REACTIONS")) await Skyra.awaitReaction(this, message);
    else await Skyra.awaitMessage(this);
    return true;
  }

  static awaitReaction(msg, message) {
    return new Promise(async (resolve, reject) => {
      try {
        await message.react("🇾");
        await message.react("🇳");
        const collector = message.createReactionCollector((reaction, user) => user.id === msg.author.id, { time: 20000, max: 1 });
        collector.on("collect", (r) => {
          if (r.emoji.name === "🇾") collector.stop("success");
          else collector.stop();
        });
        collector.on("end", (collected, reason) => {
          if (reason === "success") resolve();
          else reject();
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  static awaitMessage(msg) {
    return new Promise(async (resolve, reject) => {
      try {
        const collector = msg.channel.createMessageCollector(m => m.author === msg.author, { time: 20000, max: 1 });
        collector.on("message", (m) => {
          if (m.content.toLowerCase() === "yes") collector.stop("success");
          else collector.stop();
        });
        collector.on("end", (collected, reason) => {
          if (reason === "success") resolve();
          else reject();
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}

/* The backbone of this extendable file. Adds the properties in Arrays to their respected Structures */
const applyToClass = (structure, props) => {
  for (const prop of props) { // eslint-disable-line no-restricted-syntax
    Object.defineProperty(structure.prototype, prop, Object.getOwnPropertyDescriptor(Skyra.prototype, prop));
  }
};

// applyToClass(DMChannel, []);
// applyToClass(TextChannel, []);
applyToClass(Guild, ["configs", "moderation"]);
applyToClass(Message, ["error", "nuke", "color", "prompt", "alert"]);
applyToClass(GuildMember, ["points"]);
applyToClass(User, ["profile"]);
applyToClass(Client, ["fetch", "constants"]);
