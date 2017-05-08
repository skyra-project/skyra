class Social {

  static async add(user, money) {
    await user.profile.update({ money: user.profile.money + money });
    return money;
  }

  static async use(user, money) {
    await user.profile.update({ money: user.profile.money - money });
    return money;
  }

  static async win(msg, money) {
    if (msg.guild && msg.guild.id === "256566731684839428") money *= 1.5;
    await msg.author.profile.update({ money: msg.author.profile.money + money });
    return money;
  }

  static calc(msg) {
    let random = Math.max(Math.ceil(Math.random() * 8), 4);
    if (msg.guild && msg.guild.id === "256566731684839428") random *= 1.5;
    return Math.round(random);
  }
}

exports.init = (client) => { client.Social = Social; };
