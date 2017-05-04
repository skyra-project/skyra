const Discord = require("discord.js");
const UserProfile = require("./userProfile.js");
const GuildConfigs = require("./guildConfig.js");
const Moderation = require("./moderation.js");

const $ = (name) => { throw new Error(`${name} is a required argument.`); };

// const DMChannel = Discord.DMChannel;
// const TextChannel = Discord.TextChannel;
const Guild = Discord.Guild;
const Message = Discord.Message;
const GuildMember = Discord.GuildMember;
const User = Discord.User;

/* eslint-disable no-underscore-dangle */
class Skyra {
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
    return this.client.localScores.get(this.guild.id).get(this.user.id);
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

  alert(content = $("Content"), timer = 5000) {
    if (this.channel.postable) {
      return this.send(content).then(m => m.nuke(timer));
    }
    return null;
  }

  error(content = "", log = false) {
    if (log) this._client.emit("error", content);
    if (this.channel.postable) {
      return this.send(`|\`❌\`| **ERROR**:\n${"```"}LDIF\n${content}${"```"}`).then(m => m.nuke(10000));
    }
    return null;
  }

  nuke(time = 0, edit = 0) {
    setTimeout(() => {
      const msg = this.channel.messages.get(this.id);
      if (msg && msg._edits.length === edit) this.delete();
    }, time);
  }

  async Prompt(content = $("Prompt Content")) {
    try {
      const message = await this.send(content);
      if (this.channel.permissionsFor(this.guild.member(this.client.user)).hasPermission("ADD_REACTIONS")) await Skyra.awaitReaction(this, message);
      else await Skyra.awaitMessage(this);
    } catch (e) {
      throw e;
    }
  }

  static async awaitReaction(msg, message) {
    return new Promise(async (resolve, reject) => {
      try {
        await message.react("🇾");
        await message.react("🇳");
        const reactions = await message.awaitReactions(reaction => reaction.users.has(msg.author.id), { time: 20000, max: 1 });
        if (reactions.has("🇾")) resolve();
        else reject();
      } catch (e) {
        reject(e);
      }
    });
  }

  static async awaitMessage(msg) {
    return new Promise(async (resolve, reject) => {
      try {
        const collector = msg.channel.createCollector(m => m.author === msg.author, { time: 20000, max: 1 });
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
applyToClass(Message, ["error", "nuke", "color", "Prompt", "alert"]);
applyToClass(GuildMember, ["points"]);
applyToClass(User, ["profile"]);
