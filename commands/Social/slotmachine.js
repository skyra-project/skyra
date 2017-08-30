const { Command, Canvas } = require('../../index');

const { MessageEmbed } = require('discord.js');
const { readFile } = require('fs-nextra');
const { join } = require('path');

const icon = new (Canvas.getCanvas()).Image();

const iconsPath = join(__dirname, '../../assets/images/social/sm-icons.png');
const shinyPath = join(__dirname, '../../assets/images/social/shiny-icon.png');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['slot', 'slots', 'slotmachines'],
            guildOnly: true,
            spam: true,
            cooldown: 10,

            usage: '<50|100|200|500|1000>',
            description: "I bet 100S you ain't winning this round.",
            extendedHelp: Command.strip`
                Slotmachines!

                = Usage =
                Skyra, slotmachine [amount]
                Amount :: Either 50, 100, 200, 500, or even, 1000 shinies to bet.

                = Reminder =
                    • You will receive at least 5 times the amount (cherries/tada) at win, and up to 24 times (seven, diamond without skin).
                    • Skyra will use a 'skin' for the slotmachine icons if she has permissions to use external emojis. They simulate the icons from a real slotmachine.
            `
        });

        this.reels = [
            [0, 6, 4, 3, 8, 5, 7, 2, 1],
            [8, 2, 5, 0, 1, 7, 3, 4, 6],
            [5, 3, 8, 4, 7, 0, 6, 1, 2]
        ];

        this.combinations = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 4, 8], [2, 4, 6]];
        this.values = [5, 5, 6, 8, 10, 12, 16, 20, 24];
    }

    async run(msg, [coins]) {
        coins = parseInt(coins);

        if (msg.author.profile.money < coins) throw `you don't have enough shinies to pay your bet! Your current account balance is ${msg.author.profile.money}${Command.shiny(msg)}.`;

        const roll = this.roll();
        const calculated = this.calculate(roll, coins);
        await this.process(msg, coins, calculated);
        return this.display(msg, roll, calculated);
    }

    process(msg, coins, { win, winnings }) {
        if (win) {
            winnings *= msg.guild.settings.social.boost;
            return msg.author.profile.add(winnings);
        }
        return msg.author.profile.use(coins);
    }

    roll() {
        const roll = [];

        for (let i = 0; i < 3; i++) {
            const reel = this.reels[i];
            const random = Math.floor(Math.random() * reel.length);
            roll[i] = random === 0 ? reel[reel.length - 1] : reel[random - 1];
            roll[i + 3] = reel[random];
            roll[i + 6] = random === reel.length - 1 ? reel[0] : reel[random + 1];
        }

        return roll;
    }

    calculate(roll, coins) {
        let winnings = 0;
        for (const combo of this.combinations) {
            if (roll[combo[0]] === roll[combo[1]] && roll[combo[1]] === roll[combo[2]]) winnings += this.values[roll[combo[0]]];
        }

        if (winnings === 0) return { win: false, winnings: 0 };

        winnings *= coins;
        return { win: true, winnings };
    }

    display(msg, roll, { win, winnings }) {
        const permissions = msg.channel.permissionsFor(msg.guild.me);
        if (permissions.has('ATTACH_FILES')) return this.render(msg, roll, { win, winnings });
        const use = permissions.has('USE_EXTERNAL_EMOJIS') ? assets.emoji : assets.vanilla;

        const icons = [];
        for (let i = 0; i < roll.length; i++) icons[i] = use[roll[i]];

        const output = [
            `${icons[0]}ー${icons[1]}ー${icons[2]}`,
            `${icons[3]}ー${icons[4]}ー${icons[5]}`,
            `${icons[6]}ー${icons[7]}ー${icons[8]}`
        ].join('\n');

        const message = win ?
            msg.language.get('COMMAND_SOCIAL_SLOTMACHINES_WIN', output, winnings, Command.shiny(msg)) :
            msg.language.get('COMMAND_SOCIAL_SLOTMACHINES_LOSS', output);

        if (permissions.has('EMBED_LINKS')) return this.sendEmbed(msg, message, win);
        return msg.send(message);
    }

    sendEmbed(msg, message, win) {
        const embed = new MessageEmbed()
            .setColor(win ? 0x66BB6A : 0xAD1457)
            .setDescription(message);

        return msg.send({ embed });
    }

    async render(msg, roll, { win, winnings }) {
        const length = win ? 300 : 150;
        icon.src = await readFile(iconsPath);

        const canvas = new Canvas(length, 150)
            .save()
            .setShadowColor('rgba(51, 51, 51, 0.38)')
            .setShadowBlur(5)
            .setColor('#FFFFFF')
            .createBeveledClip(4, 4, length - 8, 142, 5)
            .fill()
            .restore()
            .save()
            .setColor(win ? '#00C853' : '#C62828')
            .setShadowColor(win ? 'rgba(64, 224, 15, 0.4)' : 'rgba(237, 29, 2, 0.4)')
            .setShadowBlur(4)
            .addRect(54, 54, 2, 38)
            .addRect(96, 54, 2, 38)
            .restore();

        await Promise.all(roll.map((value, index) => new Promise((res) => {
            const { x, y } = assets.canvas[value];
            const coord = coordinates[index];
            canvas.context.drawImage(icon, x, y, iconSize, iconSize, coord.x, coord.y, iconSize, iconSize);
            res();
        })));

        if (win) {
            const shinyIcon = await readFile(shinyPath);
            canvas
                .setTextFont('30px RobotoLight')
                .setTextAlign('right')
                .addText('You won', 280, 60)
                .addText(winnings, 250, 100)
                .addImage(shinyIcon, 260, 68, 20, 39);
        }

        const attachment = await canvas.toBufferAsync();

        return msg.send({ files: [{ attachment, name: 'Slotmachine.png' }] });
    }

};

const iconSize = 38;

const assets = {
    vanilla: [
        '🍒',
        '🎉',
        '🔅',
        '🎲',
        '⭐',
        '❤',
        '💰',
        '🔱',
        '💎'
    ],
    emoji: [
        '<:Cherry:325348811608424448>',
        '<:Bar:325348810958307328>',
        '<:Lemon:325348811725864971>',
        '<:Watermelon:325348812463931392>',
        '<:Bell:325348812010815498>',
        '<:Heart:325348812090507264>',
        '<:Horseshoe:325348811679465493>',
        '<:Diamond:325348812065603594>',
        '<:Seven:325348810979016705>'
    ],
    canvas: [
        { x: iconSize * 2, y: iconSize * 2 },
        { x: iconSize, y: iconSize * 2 },
        { x: 0, y: iconSize * 2 },
        { x: iconSize * 2, y: iconSize },
        { x: iconSize, y: iconSize },
        { x: 0, y: iconSize },
        { x: iconSize * 2, y: 0 },
        { x: iconSize, y: 0 },
        { x: 0, y: 0 }
    ]
};

const coordinates = [
    { x: 14, y: 12 },
    { x: 56, y: 12 },
    { x: 98, y: 12 },
    { x: 14, y: 54 },
    { x: 56, y: 54 },
    { x: 98, y: 54 },
    { x: 14, y: 96 },
    { x: 56, y: 96 },
    { x: 98, y: 96 }
];
