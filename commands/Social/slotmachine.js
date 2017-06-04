const reels = [
  ["🍒", "💰", "⭐", "🎲", "💎", "❤", "🔱", "🔅", "🎉"],
  ["💎", "🔅", "❤", "🍒", "🎉", "🔱", "🎲", "⭐", "💰"],
  ["❤", "🎲", "💎", "⭐", "🔱", "🍒", "💰", "🎉", "🔅"],
];
const combinations = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 4, 8], [2, 4, 6]];
const values = {
  "💎": 24,
  "🔱": 20,
  "💰": 15,
  "❤": 10,
  "⭐": 8,
  "🎲": 7,
  "🔅": 5,
  "🎉": 5,
  "🍒": 5,
};

/* eslint-disable no-throw-literal */
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
    if (this.profile.money < amount) throw `You don't have enough shekels to pay your bet! Your current account balance is ${this.profile.money}₪.`;
  }
}

exports.run = async (client, msg, [coins]) => {
  const slotmachine = new SlotMachines(msg);
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
        `You won ${winnings}₪!`,
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
  return msg.sendEmbed(embed);
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
  description: "I bet 100₪ you ain't winning this round.",
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
