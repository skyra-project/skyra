const randomcolor = require('randomcolor');
const Resolver = require('./color/index');

/* eslint id-length: ["error", { "exceptions": ["h", "s", "l", "r", "g", "b", "d", "p", "q", "t"] }] */
class Color {

    static parse(input) {
        if (/^(-r|--random)$/.test(input)) return Color._generateRandom();
        const output = Color._HEX(input)
            || Color._B10(input)
            || Color._RGB(input)
            || Color._HSL(input);

        if (output !== false) return output;
        throw 'Invalid input';
    }

    static _generateRandom() {
        const raw = randomcolor({ luminosity: 'bright' }).slice(1);
        const HEX = new Resolver.HEX(raw.substring(0, 2), raw.substring(2, 4), raw.substring(4, 6));
        return {
            hex: HEX,
            rgb: HEX.rgb,
            hsl: HEX.hsl,
            b10: HEX.b10
        };
    }

    static _RGB(input) {
        if (!/^rgba?\(\d{1,3},\s?\d{1,3},\s?\d{1,3}(?:,.+)?\)$/.test(input)) return false;
        const raw = /^rgba?\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})(?:,.+)?\)$/.exec(input);
        const RGB = new Resolver.RGB(parseInt(raw[1]), parseInt(raw[2]), parseInt(raw[3]));
        return {
            hex: RGB.hex,
            rgb: RGB,
            hsl: RGB.hsl,
            b10: RGB.b10
        };
    }

    static _HEX(input) {
        if (!/^#[0-9a-fA-F]{6}$/.test(input)) return false;
        const raw = /^#([0-9a-fA-F]{6})$/.exec(input)[1];
        const HEX = new Resolver.HEX(raw.substring(0, 2), raw.substring(2, 4), raw.substring(4, 6));
        return {
            hex: HEX,
            rgb: HEX.rgb,
            hsl: HEX.hsl,
            b10: HEX.b10
        };
    }

    static _HSL(input) {
        if (!/^hsl\(\d{1,3},\s?\d{1,3},\s?\d{1,3}\)$/.test(input)) return false;
        const raw = /^hsl\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})\)$/.exec(input);
        const HSL = new Resolver.HSL(parseInt(raw[1]), parseInt(raw[2]), parseInt(raw[3]));
        return {
            hex: HSL.hex,
            rgb: HSL.rgb,
            hsl: HSL,
            b10: HSL.b10
        };
    }

    static _B10(input) {
        if (!/^\d{1,8}$/.test(input)) return false;
        const B10 = new Resolver.B10(input);
        return {
            hex: B10.hex,
            rgb: B10.rgb,
            hsl: B10.hsl,
            b10: B10
        };
    }

    static luminance(r, g, b) {
        return (0.299 * (r ** 2)) + (0.587 * (g ** 2)) + (0.114 * (b ** 2));
    }

    static hexConcat(r, g, b) {
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    static fulFill(value, fill = 0, number = 2) {
        const length = value.toString().length;
        return `${fill.toString().repeat(number - length)}${value}`;
    }

}

Color.Resolver = Resolver;

module.exports = Color;
