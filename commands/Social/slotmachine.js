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
        const array = [];
        if (this.msg.channel.permissionsFor(this.msg.guild.me).has("USE_EXTERNAL_EMOJIS")) for (let i = 0; i < 9; i++) array[i] = skin[roll[i]];
        else for (let i = 0; i < 9; i++) array[i] = roll[i];
        return [
            `${array[0]}ー${array[1]}ー${array[2]}`,
            `${array[3]}ー${array[4]}ー${array[5]}`,
            `${array[6]}ー${array[7]}ー${array[8]}`,
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
        if (this.profile.money < amount) throw `you don't have enough shinies to pay your bet! Your current account balance is ${this.profile.money}${this.msg.shiny}.`;
    }
}

exports.run = async (client, msg, [coins]) => {
    const slotmachine = new SlotMachines(msg);
    coins = parseInt(coins);
    slotmachine.checkCurrency(coins);

    const roll = slotmachine.generateRoll();
    const results = slotmachine.calculateWinnings(coins, roll);

    if (results.win) results.winnings = await msg.author.profile.win(results.winnings, msg.guild).catch(e => msg.error(e, true));
    else msg.author.profile.use(coins).catch(e => msg.error(e, true));

    if (msg.channel.permissionsFor(msg.guild.me).has("ATTACH_FILES")) {
        const output = await this.canvas(client, roll, results);
        return msg.channel.send({ files: [{ attachment: output, name: "test.png" }] });
    }
    const output = slotmachine.showRoll(roll);
    const embed = new client.methods.Embed();
    if (results.win) {
        embed.setColor(0x5C913B)
      .setDescription([
          "**You rolled:**\n",
          output,
          "\n**Congratulations!**",
          `You won ${results.winnings}${msg.shiny}!`,
      ].join("\n"));
    } else {
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

const { readFile } = require("fs-nextra");
const Canvas = require("canvas");
const { join } = require("path");

Canvas.registerFont(join(__dirname, "../../assets/fonts/Roboto-Light.ttf"), { family: "RobotoLight" });
const iconsPath = join(__dirname, "../../assets/images/social/sm-icons.png");
const shinyPath = join(__dirname, "../../assets/images/social/shiny-icon.png");

const coordinates = [
    { x: 14, y: 12 },
    { x: 56, y: 12 },
    { x: 98, y: 12 },
    { x: 14, y: 54 },
    { x: 56, y: 54 },
    { x: 98, y: 54 },
    { x: 14, y: 96 },
    { x: 56, y: 96 },
    { x: 98, y: 96 },
];

const iconSize = 38;

const resolveSprite = {
    "💎": { x: 0, y: 0 },
    "🔱": { x: iconSize, y: 0 },
    "💰": { x: iconSize * 2, y: 0 },
    "❤": { x: 0, y: iconSize },
    "⭐": { x: iconSize, y: iconSize },
    "🎲": { x: iconSize * 2, y: iconSize },
    "🔅": { x: 0, y: iconSize * 2 },
    "🎉": { x: iconSize, y: iconSize * 2 },
    "🍒": { x: iconSize * 2, y: iconSize * 2 },
};

exports.canvas = async (client, roll, { win, winnings }) => {
    const length = win ? 300 : 150;
    const canvas = new Canvas(length, 150);
    const icon = new Canvas.Image();
    const ctx = canvas.getContext("2d");

    ctx.save();
    ctx.shadowColor = "rgba(51, 51, 51, 0.38)";
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.shadowBlur = 5;
    client.funcs.canvas.fillRoundRect(ctx, 4, 4, length - 8, 142, 5);
    ctx.restore();

    icon.src = await readFile(iconsPath);

    await Promise.all(roll.map((value, index) => new Promise((res) => {
        const { x, y } = resolveSprite[value];
        const coord = coordinates[index];
        ctx.drawImage(icon, x, y, iconSize, iconSize, coord.x, coord.y, iconSize, iconSize);
        res();
    })));

    ctx.save();
    ctx.fillStyle = win ? "rgb(64, 224, 15)" : "rgb(237, 29, 2)";
    ctx.shadowColor = win ? "rgba(64, 224, 15, 0.4)" : "rgba(237, 29, 2, 0.4)";
    ctx.shadowBlur = 4;
    ctx.fillRect(54, 54, 2, 38);
    ctx.fillRect(96, 54, 2, 38);
    ctx.restore();

    if (win) {
        const shiny = new Canvas.Image();
        shiny.src = await readFile(shinyPath);
        ctx.font = "30px RobotoLight";
        ctx.textAlign = "right";
        ctx.fillText("You won", 280, 60);
        ctx.fillText(winnings, 250, 100);
        ctx.drawImage(shiny, 260, 68, 20, 39);
    }

    return canvas.toBuffer();
};
