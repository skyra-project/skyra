class LockDown {
  constructor(msg, channel) {
    Object.defineProperty(this, "msg", { value: msg });
    Object.defineProperty(this, "channel", { value: channel });
    Object.defineProperty(this, "client", { value: msg.client });
    Object.defineProperty(this, "role", { value: msg.guild.defaultRole });
  }

  async unlock() {
    await this.channel.overwritePermissions(this.role, { SEND_MESSAGES: true });
    clearTimeout(this.channel.lockdown);
    delete this.channel.lockdown;
    return `Lockdown for ${this.channel} released`;
  }

  async lock(time) {
    const message = await this.msg.send(`\`Locking the channel #${this.channel.name}...\``);
    await this.channel.overwritePermissions(this.role, { SEND_MESSAGES: false });
    if (this.channel.postable) await message.edit(`The channel ${this.channel} has been locked.`);
    if (time) {
      time = this.client.funcs.wrappers.timer(time);
      this.channel.lockdown = setTimeout(() => { this.unlock().then(c => message.edit(c).catch()).catch(e => this.msg.error(e)); }, time);
    }
  }
}

exports.run = async (client, msg, [channel = msg.channel, ...time]) => {
  const lockdown = new LockDown(msg, channel);
  if (msg.channel.lockdown) {
    const response = await lockdown.unlock();
    return msg.alert(response);
  }
  return lockdown.lock(time);
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: ["lock"],
  permLevel: 2,
  botPerms: ["MANAGE_CHANNELS"],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 30,
};

exports.help = {
  name: "lockdown",
  description: "Locks the channel.",
  usage: "[channel:channel] [time:string]",
  usageDelim: " ",
};
