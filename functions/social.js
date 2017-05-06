class Social {
  constructor(client) {
    Object.defineProperty(this, "client", { value: client });
  }

  async add(user, money) {
    await user.profile.ensureProfile();
    await this.client.rethink.update("users", user.id, { money: user.profile.money + money });
    this.client.cacheProfiles.get(user.id).money += money;
    return money;
  }

  async use(user, money) {
    await user.profile.ensureProfile();
    await this.client.rethink.update("users", user.id, { money: user.profile.money - money });
    this.client.cacheProfiles.get(user.id).money -= money;
    return money;
  }

  async win(msg, money) {
    await msg.author.profile.ensureProfile();
    if (msg.guild && msg.guild.id === "256566731684839428") money *= 1.5;
    await this.client.rethink.update("users", msg.author.id, { money: msg.author.profile.money + money });
    this.client.cacheProfiles.get(msg.author.id).money += money;
    return money;
  }
}

exports.init = (client) => { client.Social = Social; };
