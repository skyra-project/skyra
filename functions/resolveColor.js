const hsluv = require('hsluv');
const randomcolor = require('randomcolor');

/* eslint-disable no-use-before-define */
/* eslint id-length: ["error", { "exceptions": ["h", "s", "l", "r", "g", "b", "d", "p", "q", "t"] }] */
exports.validate = (input) => {
    if (/^(-r|--random)$/.test(input)) {
        const raw = randomcolor({ luminosity: 'bright' }).slice(1);
        const HEX = new this.Resolver.HEX(raw.substring(0, 2), raw.substring(2, 4), raw.substring(4, 6));
        HEX.valid();
        return {
            hex: HEX,
            rgb: HEX.rgb,
            hsl: HEX.hsl,
            hsluv: HEX.hsluv,
            b10: HEX.b10
        };
    } else if (/^rgba?\(\d{1,3},\s?\d{1,3},\s?\d{1,3}(?:,.+)?\)$/.test(input)) {
        const raw = /^rgba?\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})(?:,.+)?\)$/.exec(input);
        const RGB = new this.Resolver.RGB(parseInt(raw[1]), parseInt(raw[2]), parseInt(raw[3]));
        RGB.valid();
        return {
            hex: RGB.hex,
            rgb: RGB,
            hsl: RGB.hsl,
            hsluv: RGB.hsluv,
            b10: RGB.b10
        };
    } else if (/^#[0-9a-fA-F]{6}$/.test(input)) {
        const raw = /^#([0-9a-fA-F]{6})$/.exec(input)[1];
        const HEX = new this.Resolver.HEX(raw.substring(0, 2), raw.substring(2, 4), raw.substring(4, 6));
        HEX.valid();
        return {
            hex: HEX,
            rgb: HEX.rgb,
            hsl: HEX.hsl,
            hsluv: HEX.hsluv,
            b10: HEX.b10
        };
    } else if (/^hsl\(\d{1,3},\s?\d{1,3},\s?\d{1,3}\)$/.test(input)) {
        const raw = /^hsl\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})\)$/.exec(input);
        const HSL = new this.Resolver.HSL(parseInt(raw[1]), parseInt(raw[2]), parseInt(raw[3]));
        HSL.valid();
        return {
            hex: HSL.hex,
            rgb: HSL.rgb,
            hsl: HSL,
            hsluv: HSL.hsluv,
            b10: HSL.b10
        };
    } else if (/^hsluv\(\d{1,3},\s?\d{1,3},\s?\d{1,3}\)$/.test(input)) {
        const raw = /^hsluv\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})\)$/.exec(input);
        const HSLUV = new this.Resolver.HSLUV(parseInt(raw[1]), parseInt(raw[2]), parseInt(raw[3]));
        HSLUV.valid();
        return {
            hex: HSLUV.hex,
            rgb: HSLUV.rgb,
            hsl: HSLUV.hsl,
            hsluv: HSLUV,
            b10: HSLUV.b10
        };
    } else if (/^\d{1,8}$/.test(input)) {
        const B10 = new this.Resolver.B10(input);
        B10.valid();
        return {
            hex: B10.hex,
            rgb: B10.rgb,
            hsl: B10.hsl,
            hsluv: B10.hsluv,
            b10: B10
        };
    }
    throw new TypeError('Invalid input');
};

/**
 * HSLUV Parser.
 * @param {number} h Hue. (0 - 360)
 * @param {number} s Saturation. (0 - 100)
 * @param {number} l Lightness. (0 - 100)
 */
const HSLUV = class HSLUV {

    constructor(h, s, l) {
        this.h = parseInt(h);
        this.s = parseInt(s);
        this.l = parseInt(l);
    }

    valid() {
        if (this.h < 0 || this.h > 360) throw `Invalid Hue range. Must be between 0 and 360, and it is ${this.h}`;
        if (this.s < 0 || this.s > 100) throw `Invalid Saturation range. Must be between 0 and 100, and it is ${this.s}`;
        if (this.l < 0 || this.l > 100) throw `Invalid Lightness range. Must be between 0 and 100, and it is ${this.l}`;
        return true;
    }

    get hsluv() {
        return this;
    }

    get hex() {
        const hex = hsluv.hsluvToHex([this.h, this.s, this.l]);
        return new HEX(hex.substring(1, 3), hex.substring(3, 5), hex.substring(5, 7));
    }

    get rgb() {
        const [r, g, b] = hsluv.hsluvToRgb([this.h, this.s, this.l]);
        return new RGB(r * 255, g * 255, b * 255);
    }

    get hsl() {
        return this.rgb.hsl;
    }

    get b10() {
        return this.hex.b10;
    }

    toString() {
        return String(`hsluv(${this.h}, ${this.s}, ${this.l})`);
    }

};

/**
 * HEX Parser.
 * @param {string} r Red value. ('00' - 'ff')
 * @param {string} g Green value. ('00' - 'ff')
 * @param {string} b Blue value. ('00' - 'ff')
 */
const HEX = class HEX {

    constructor(r, g, b) {
        this.r = r.padStart(2, 0);
        this.g = g.padStart(2, 0);
        this.b = b.padStart(2, 0);
    }

    valid() {
        if (isNaN(parseInt(this.r, 16))) throw `Invalid Red range. Must be between '00' and 'ff', and it is '${this.r}'`;
        if (isNaN(parseInt(this.g, 16))) throw `Invalid Green range. Must be between '00' and 'ff', and it is '${this.g}'`;
        if (isNaN(parseInt(this.b, 16))) throw `Invalid Blue range. Must be between '00' and 'ff', and it is '${this.b}'`;
        return true;
    }

    get hsluv() {
        const [h, s, l] = hsluv.hexToHsluv(this.r + this.g + this.b);
        return new HSLUV(h, s, l);
    }

    get hex() {
        return this;
    }

    get rgb() {
        return new RGB(parseInt(this.r, 16), parseInt(this.g, 16), parseInt(this.b, 16));
    }

    get hsl() {
        return this.rgb.hsl;
    }

    get b10() {
        return new B10(parseInt(this.r + this.g + this.b, 16));
    }

    toString() {
        return String(`#${this.r}${this.g}${this.b}`);
    }

};

/**
 * RGB Parser.
 * @param {number} r Red value. (0 - 255)
 * @param {number} g Green value. (0 - 255)
 * @param {number} b Blue value. (0 - 255)
 */
const RGB = class RGB {

    constructor(r, g, b) {
        this.r = parseInt(r);
        this.g = parseInt(g);
        this.b = parseInt(b);
    }

    valid() {
        if (this.r < 0 || this.r > 255) throw `Invalid Red range. Must be between 0 and 255, and it is ${this.r}`;
        if (this.g < 0 || this.g > 255) throw `Invalid Green range. Must be between 0 and 255, and it is ${this.g}`;
        if (this.b < 0 || this.b > 255) throw `Invalid Blue range. Must be between 0 and 255, and it is ${this.b}`;
        return true;
    }

    get hsluv() {
        const [r, g, b] = hsluv.rgbToHsluv([this.r, this.g, this.b]);
        return new HSLUV(r, g, b);
    }

    get hex() {
        return new HEX(this.r.toString(16), this.g.toString(16), this.b.toString(16));
    }

    get rgb() {
        return this;
    }

    get hsl() {
        const r = this.r / 255;
        const g = this.g / 255;
        const b = this.b / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h;
        let s;
        const l = (max + min) / 2;

        if (max === min) {
            /* Achromatic */
            h = 0; s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d) + (g < b ? 6 : 0);
                    break;
                case g: h = ((b - r) / d) + 2;
                    break;
                case b: h = ((r - g) / d) + 4;
                    break;
                // no default
            }
            h /= 6;
        }
        return new HSL(Math.round(h * 360), Math.round(s * 100), Math.round(l * 100));
    }

    get b10() {
        return this.hex.b10;
    }

    toString() {
        return String(`rgb(${this.r}, ${this.g}, ${this.b})`);
    }

};

/**
 * HSL Parser.
 * @param {number} h Hue. (0 - 360)
 * @param {number} s Saturation. (0 - 100)
 * @param {number} l Lightness. (0 - 100)
 */
const HSL = class HSL {

    constructor(h, s, l) {
        this.h = parseInt(h);
        this.s = parseInt(s);
        this.l = parseInt(l);
    }

    valid() {
        if (this.h < 0 || this.h > 360) throw `Invalid Hue range. Must be between 0 and 360, and it is ${this.h}`;
        if (this.s < 0 || this.s > 100) throw `Invalid Saturation range. Must be between 0 and 100, and it is ${this.s}`;
        if (this.l < 0 || this.l > 100) throw `Invalid Lightness range. Must be between 0 and 100, and it is ${this.l}`;
        return true;
    }

    get hsluv() {
        return this.rgb.hsluv;
    }

    get hex() {
        return this.rgb.hex;
    }

    get rgb() {
        const h = this.h / 360;
        const s = this.s / 100;
        const l = this.l / 100;
        /* Parse HSL to RGB */
        let r;
        let g;
        let b;

        if (s === 0) {
            /* Achromatic */
            r = l;
            g = l;
            b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (((q - p) * 6) * t);
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (((q - p) * ((2 / 3) - t)) * 6);
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : (l + s) - (l * s);
            const p = (2 * l) - q;
            r = hue2rgb(p, q, h + (1 / 3));
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - (1 / 3));
        }
        return new RGB(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
    }

    get hsl() {
        return this;
    }

    get b10() {
        return this.hex.b10;
    }

    toString() {
        return String(`hsl(${this.h}, ${this.s}, ${this.l})`);
    }

};

/**
 * B10 Parser.
 * @param {number} value Base10 (0 - 0xFFFFFF)
 */
const B10 = class B10 {

    constructor(value) {
        this.value = parseInt(value);
    }

    valid() {
        if (this.value < 0 || this.value > 0xFFFFFF) throw 'Color must be within the range 0 - 16777215 (0xFFFFFF).';
        return true;
    }

    get hsluv() {
        return this.hex.hsluv;
    }

    get hex() {
        const hex = this.value.toString(16).padStart(6, '0');
        return new HEX(hex.substring(0, 2), hex.substring(2, 4), hex.substring(4, 6));
    }

    get rgb() {
        return this.hex.rgb;
    }

    get hsl() {
        return this.hex.hsl;
    }

    get b10() {
        return this;
    }

    toString() {
        return String(this.value);
    }

};

exports.Resolver = { HSLUV, HEX, RGB, HSL, B10 };

exports.luminance = (r, g, b) => (0.299 * (r ** 2)) + (0.587 * (g ** 2)) + (0.114 * (b ** 2));

exports.hexConcat = (r, g, b) => `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

exports.fulFill = (value, fill = 0, number = 2) => {
    const length = value.toString().length;
    return `${fill.toString().repeat(number - length)}${value}`;
};
