const { Command } = require('../../index');
const { luminance, hexConcat, validate: validateColor } = require('../../functions/resolveColor');
const { join, resolve } = require('path');
const Canvas = require('canvas');

Canvas.registerFont(resolve(join(__dirname, '../../assets/fonts/FiraSans-Regular.ttf')), { family: 'FiraSans' });

/* Color limiter */
const cL = colour => Math.max(Math.min(colour, 255), 0);

const sCL = (colour) => {
    if (colour > 110) return 0;
    return 255;
};

/* eslint id-length: ["error", { "exceptions": ["c", "R", "G", "B"] }] */

/* eslint-disable class-methods-use-this */
module.exports = class Color extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['colour'],
            mode: 2,

            usage: '<color:string> [separator:int{0,255}]',
            usageDelim: ' >',
            description: 'Display some awesome colours.',
            extendedHelp: Command.strip`
                Hey! Do you want me to display a color?
                
                = Usage =
                Skyra, colour [color] >[separator]
                Colour    :: Hex code of the color you want displayed
                Separator :: Defaults to 10, it sets the RGB (from 0 to 255) difference between tones.
                
                = Supported formats =
                • HEX    :: #RRGGBB
                • RGB    :: rgb(RRR, GGG, BBB)
                • HSL    :: hsl(HHH, SSS, LLL)
                • HSLUV  :: hsluv(HHH, SSS, LLL)
                • BASE10 :: 0 - 16777215
                
                = Examples =
                • Skyra, colour #ff73c1
                    I display a lot of info from this color.
            `
        });
    }

    async run(msg, [input, diff = 10]) {
        const { hex, hsl, hsluv, rgb } = validateColor(input);

        const output = await this.showColor(rgb, diff);
        return msg.channel.send([
            `Color: **${hex}**`,
            `RGB: ${rgb}`,
            `HSL: ${hsl}`,
            `HSLᵤᵥ: ${hsluv}`
        ].join('\n'), { files: [{ attachment: output, name: 'color.png' }] });
    }

    async showColor(color, diff) {
        const c = new Canvas(370, 390);
        const ctx = c.getContext('2d');

        const red = color.r;
        const green = color.g;
        const blue = color.b;

        let thisLum;
        ctx.font = '18px FiraSans';
        const colours = [
            { R: red + (diff * 2), G: green, B: blue, pos: [5, 5] },
            { R: red + diff, G: green + diff, B: blue, pos: [5, 125] },
            { R: red, G: green + (diff * 2), B: blue, pos: [5, 245] },
            { R: red + diff, G: green, B: blue + diff, pos: [125, 5] },
            { R: red, G: green, B: blue, pos: [125, 125] },
            { R: red - diff, G: green, B: blue - diff, pos: [125, 245] },
            { R: red, G: green, B: blue + (diff * 2), pos: [245, 5] },
            { R: red - diff, G: green - diff, B: blue, pos: [245, 125] },
            { R: red - (diff * 2), G: green - (diff * 2), B: blue - (diff * 2), pos: [245, 245] }
        ];

        await Promise.all(colours.map(colour => new Promise((res) => {
            const [thisRed, thisGreen, thisBlue] = [cL(colour.R), cL(colour.G), cL(colour.B)];
            ctx.fillStyle = `rgb(${thisRed}, ${thisGreen}, ${thisBlue})`;
            ctx.fillRect(colour.pos[0], colour.pos[1], 120, 120);
            thisLum = sCL(luminance(thisRed, thisGreen, thisBlue));
            ctx.fillStyle = `rgb(${thisLum}, ${thisLum}, ${thisLum})`;
            ctx.fillText(
                hexConcat(cL(colour.R), cL(colour.G), cL(colour.B)),
                10 + colour.pos[0],
                20 + colour.pos[1],
            );
            res();
        })));

        /* Complementary */
        ctx.fillStyle = `rgb(${255 - red}, ${255 - green}, ${255 - blue})`;
        ctx.fillRect(5, 365, 360, 20);
        thisLum = luminance(255 - red, 255 - green, 255 - blue);
        ctx.font = '16px FiraSans';
        ctx.fillStyle = `rgb(${sCL(thisLum)}, ${sCL(thisLum)}, ${sCL(thisLum)})`;
        ctx.fillText(
            hexConcat(255 - red, 255 - green, 255 - blue),
            15,
            22 + 360,
        );

        return c.toBuffer();
    }

};
