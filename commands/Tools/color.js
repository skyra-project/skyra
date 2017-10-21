const { Command, colorUtil: { parse, luminance, hexConcat }, Canvas } = require('../../index');

/* Color limiter */
const cL = colour => Math.max(Math.min(colour, 255), 0);
const sCL = (colour) => colour >= 128 ? 0 : 255;

/* eslint id-length: ["error", { "exceptions": ["c", "R", "G", "B", "x", "y"] }] */
module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['colour'],
            botPerms: ['ATTACH_FILES'],
            mode: 2,
            cooldown: 15,

            usage: '<color:string> [separator:int{0,255}]',
            usageDelim: ' >',
            description: 'Display some awesome colours.',
            extend: {
                EXPLANATION: [
                    'Hey! Do you want me to display a color?'
                ].join(' '),
                ARGUMENTS: '<color> >[separator]',
                EXP_USAGE: [
                    ['color', 'The colour value you want to be displayed.'],
                    ['separator', 'Defaults to 10, it sets the RGB (from 0 to 255) difference between tones.']
                ],
                FORMATS: [
                    ['HEX', '#RRGGBB'],
                    ['RGB', 'rgb(RRR, GGG, BBB)'],
                    ['HSL', 'hsl(HHH, SSS, LLL)'],
                    ['BASE10', '0 - 16777215']
                ],
                EXAMPLES: [
                    '#ff73c1',
                    'rgb(255, 115, 193) >35',
                    'hsl(327, 100, 73)'
                ]
            }
        });
    }

    async run(msg, [input, diff = 10], settings, i18n) {
        const { hex, hsl, rgb } = parse(input);

        const attachment = await this.showColor(rgb, diff);
        return msg.channel.send(i18n.get('COMMAND_COLOR', hex, rgb, hsl), { files: [{ attachment, name: 'color.png' }] });
    }

    async showColor(color, diff) {
        const red = color.r;
        const green = color.g;
        const blue = color.b;

        const canvas = new Canvas(370, 390)
            .setTextFont('18px FiraSans');

        await Promise.all([
            this.processFrame(canvas.context, 5, 5, cL(red + (diff * 2)), cL(green), cL(blue)),
            this.processFrame(canvas.context, 5, 125, cL(red + diff), cL(green + diff), cL(blue)),
            this.processFrame(canvas.context, 5, 245, cL(red), cL(green + (diff * 2)), cL(blue)),
            this.processFrame(canvas.context, 125, 5, cL(red + diff), cL(green), cL(blue + diff)),
            this.processFrame(canvas.context, 125, 125, cL(red), cL(green), cL(blue)),
            this.processFrame(canvas.context, 125, 245, cL(red - diff), cL(green), cL(blue - diff)),
            this.processFrame(canvas.context, 245, 5, cL(red), cL(green), cL(blue + (diff * 2))),
            this.processFrame(canvas.context, 245, 125, cL(red - diff), cL(green - diff), cL(blue)),
            this.processFrame(canvas.context, 245, 245, cL(red - (diff * 2)), cL(green - (diff * 2)), cL(blue - (diff * 2)))
        ]);

        /* Complementary */
        const thisLum = sCL(luminance(255 - red, 255 - green, 255 - blue));
        return canvas
            .setColor(`rgb(${255 - red}, ${255 - green}, ${255 - blue})`)
            .addRect(5, 365, 360, 20)
            .setTextFont('16px FiraSans')
            .setColor(`rgb(${thisLum}, ${thisLum}, ${thisLum})`)
            .addText(hexConcat(255 - red, 255 - green, 255 - blue), 15, 382)
            .toBufferAsync();
    }

    processFrame(ctx, x, y, red, green, blue) {
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fillRect(x, y, 120, 120);
        const thisLum = sCL(luminance(red, green, blue));
        ctx.fillStyle = `rgb(${thisLum}, ${thisLum}, ${thisLum})`;
        ctx.fillText(
            hexConcat(red, green, blue),
            10 + x,
            20 + y,
        );
    }

};
