const reels = [
  ["🍒", "💰", "⭐", "🎲", "💎", "❤", "🔱", "🔅", "🎉"],
  ["💎", "🔅", "❤", "🍒", "🎉", "🔱", "🎲", "⭐", "💰"],
  ["❤", "🎲", "💎", "⭐", "🔱", "🍒", "💰", "🎉", "🔅"],
];
const combinations = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 4, 8], [2, 4, 6]];
const values = {
  "💎": 24,
  "🔱": 20,
  "💰": 16,
  "❤": 12,
  "⭐": 10,
  "🎲": 8,
  "🔅": 6,
  "🎉": 5,
  "🍒": 5,
};
const skin = { "💎": "<:Seven:325348810979016705>", "🔱": "<:Diamond:325348812065603594>", "💰": "<:Horseshoe:325348811679465493>", "❤": "<:Heart:325348812090507264>", "⭐": "<:Bell:325348812010815498>", "🎲": "<:Watermelon:325348812463931392>", "🔅": "<:Lemon:325348811725864971>", "🎉": "<:Bar:325348810958307328>", "🍒": "<:Cherry:325348811608424448>" };

class SlotMachines {
  constructor(msg) {
    this.client = msg.client;
    this.msg = msg;
    this.profile = msg.author.profile;
    this.generateRoll = SlotMachines.generateRoll;
    this.showRoll = SlotMachines.showRoll;
    this.calculateWinnings = SlotMachines.calculateWinnings;
  }

  static generateRoll() {
    const roll = [];
    reels.forEach((reel, index) => {
      const rand = Math.floor(Math.random() * reel.length);
      roll[index] = rand === 0 ? reel[reel.length - 1] : reel[rand - 1];
      roll[index + 3] = reel[rand];
      roll[index + 6] = rand === reel.length - 1 ? reel[0] : reel[rand + 1];
    });

    return roll;
  }

  static showRoll(roll) {
    if (this.msg.channel.permissionsFor(this.msg.guild.me).has("USE_EXTERNAL_EMOJIS")) for (let i = 0; i < roll.length; i++) roll[i] = skin[roll[i]];
    return [
      `${roll[0]}ー${roll[1]}ー${roll[2]}`,
      `${roll[3]}ー${roll[4]}ー${roll[5]}`,
      `${roll[6]}ー${roll[7]}ー${roll[8]}`,
    ].join("\n");
  }

  static calculateWinnings(coins, roll) {
    let winnings = 0;
    combinations.forEach((combo) => {
      if (roll[combo[0]] === roll[combo[1]] && roll[combo[1]] === roll[combo[2]]) winnings += values[roll[combo[0]]];
    });
    if (winnings === 0) return { win: false, winnings: 0 };
    winnings *= coins;
    return { win: true, winnings: Math.round(winnings) };
  }

  checkCurrency(amount) {
    if (this.profile.money < amount) throw `you don't have enough shekels to pay your bet! Your current account balance is ${this.profile.money}${this.msg.shiny}.`;
  }
}

exports.run = async (client, msg, [coins]) => {
  const slotmachine = new SlotMachines(msg);
  coins = parseInt(coins);
  slotmachine.checkCurrency(coins);

  const roll = slotmachine.generateRoll();
  const output = slotmachine.showRoll(roll);
  const data = slotmachine.calculateWinnings(coins, roll);

  const embed = new client.methods.Embed();
  if (data.win) {
    const winnings = await client.Social.win(msg, data.winnings);
    embed.setColor(0x5C913B)
      .setDescription([
        "**You rolled:**\n",
        output,
        "\n**Congratulations!**",
        `You won ${winnings}${msg.shiny}!`,
      ].join("\n"));
  } else {
    await msg.author.profile.use(coins);
    embed.setColor(0xBE1931)
      .setDescription([
        "**You rolled:**\n",
        output,
        "\n**Mission failed!**",
        "We'll get em next time!",
      ].join("\n"));
  }
  return msg.send({ embed });
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["slotmachines", "slot"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: true,
  mode: 1,
  cooldown: 5,
};

exports.help = {
  name: "slotmachine",
  description: "I bet 100S you ain't winning this round.",
  usage: "<50|100|200|500|1000>",
  usageDelim: "",
  extendedHelp: [
    "Come with me and bet some shekels. Go big or go home.",
    "",
    "Usage:",
    "&slotmachine <50|100|200|500|1000>",
    "",
    " ❯ amount: Amount of shekels you want to bet.",
    "",
    "Examples:",
    "&slotmachine 200",
  ].join("\n"),
};
