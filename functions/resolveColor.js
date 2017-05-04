const { hexToHsluv } = require("hsluv");
const randomcolor = require("randomcolor");

class ResolverColor {
  constructor() {
    this.luminance = ResolverColor.luminance;
    this.hexConcat = ResolverColor.hexConcat;
    this.fulFill = ResolverColor.fulFill;

    this.validate = ResolverColor.validate;

    this.parseBase10 = ResolverColor.parseBase10;
    this.parseHSL = ResolverColor.parseHSL;

    this.hex2hsluv = ResolverColor.hex2hsluv;
    this.hex2hsl = ResolverColor.hex2hsl;
    this.hex2rgb = ResolverColor.hex2rgb;

    this.hsl2hsluv = ResolverColor.hsl2hsluv;

    this.rgb2hsluv = ResolverColor.rgb2hsluv;
    this.rgb2hsl = ResolverColor.rgb2hsl;
    this.rgb2hex = ResolverColor.rgb2hex;
  }

  static validate(input) {
    if (/^(-r|--random)$/.test(input)) {
      const rgb = randomcolor({ luminosity: "bright" }).slice(1);
      const hex = {
        r: this.fulFill(rgb.substring(0, 2)),
        g: this.fulFill(rgb.substring(2, 4)),
        b: this.fulFill(rgb.substring(4, 6)),
        parsed: this.fulFill(rgb.substring(0, 2)) + this.fulFill(rgb.substring(2, 4)) + this.fulFill(rgb.substring(4, 6)),
      };
      return {
        hex,
        rgb: this.hex2rgb(hex.r, hex.g, hex.b),
        hsl: this.hex2hsl(hex.r, hex.g, hex.b),
      };
    } else if (/^rgba?\(\d{1,3},\s?\d{1,3},\s?\d{1,3}(?:,.+)?\)$/.test(input)) {
      const rgb = /^rgba?\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})(?:,.+)?\)$/.exec(input);
      const hex = this.rgb2hex(rgb[1], rgb[2], rgb[3]);
      const hsl = this.rgb2hsl(rgb[1], rgb[2], rgb[3]);
      return {
        hex,
        rgb: {
          r: parseInt(rgb[1]),
          g: parseInt(rgb[2]),
          b: parseInt(rgb[3]),
          parsed: `rgb(${rgb[1]}, ${rgb[2]}, ${rgb[3]})`,
        },
        hsl,
      };
    } else if (/^#[0-9a-fA-F]{6}$/.test(input)) {
      const rgb = /^#([0-9a-fA-F]{6})$/.exec(input)[1];
      const hex = {
        r: this.fulFill(rgb.substring(0, 2)),
        g: this.fulFill(rgb.substring(2, 4)),
        b: this.fulFill(rgb.substring(4, 6)),
        parsed: this.fulFill(rgb.substring(0, 2)) + this.fulFill(rgb.substring(2, 4)) + this.fulFill(rgb.substring(4, 6)),
      };
      return {
        hex,
        rgb: this.hex2rgb(hex.r, hex.g, hex.b),
        hsl: this.hex2hsl(hex.r, hex.g, hex.b),
      };
    } else if (/^hsl\(\d{1,3},\s?\d{1,3},\s?\d{1,3}\)$/.test(input)) {
      const hsl = /^hsl\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})\)$/.exec(input);
      return this.parseHSL(hsl[1], hsl[2], hsl[3]);
    } else if (/^\d{1,8}$/.test(input)) {
      input = parseInt(input);
      if (input < 0 || input > 0xFFFFFF) throw new RangeError("Color must be within the range 0 - 16777215 (0xFFFFFF).");
      return this.parseBase10(input);
    }
    throw new TypeError("Invalid input");
  }

  static hex2hsluv(r, g, b) {
    const HSLuv = hexToHsluv(`${r}${g}${b}`);
    return {
      h: Math.round(HSLuv[0]),
      s: Math.round(HSLuv[1]),
      l: Math.round(HSLuv[2]),
    };
  }

  static hex2hsl(r, g, b) {
    return this.rgb2hsl(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16));
  }

  static hex2rgb(r, g, b) {
    return {
      r: parseInt(`0x${this.fulFill(r)}`),
      g: parseInt(`0x${this.fulFill(g)}`),
      b: parseInt(`0x${this.fulFill(b)}`),
      parsed: `rgb(${parseInt(`0x${this.fulFill(r)}`)}, ${parseInt(`0x${this.fulFill(g)}`)}, ${parseInt(`0x${this.fulFill(b)}`)})`,
    };
  }

  static hsl2hsluv(h, s, l) {
    const hex = this.parseHSL(h, s, l).hex;
    return this.hex2hsluv(hex.r, hex.g, hex.b);
  }

  static parseHSL(h, s, l) {
    h = parseInt(h) / 360;
    s = parseInt(s) / 100;
    l = parseInt(l) / 100;
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

    const rgb = {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };

    const hex = this.rgb2hex(rgb.r, rgb.g, rgb.b);
    return {
      hex,
      rgb: {
        r: rgb.r,
        g: rgb.g,
        b: rgb.b,
        parsed: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      },
      hsl: {
        h: Math.round((h * 360) % 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
      },
    };
  }

  static rgb2hsluv(r, g, b) {
    const hex = this.rgb2hex(r, g, b);
    return this.hex2hsluv(hex.r, hex.g, hex.b);
  }

  static rgb2hsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
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
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  static rgb2hex(r, g, b) {
    return {
      r: this.fulFill(parseInt(r).toString(16)),
      g: this.fulFill(parseInt(g).toString(16)),
      b: this.fulFill(parseInt(b).toString(16)),
      parsed: this.fulFill(parseInt(r).toString(16)) + this.fulFill(parseInt(g).toString(16)) + this.fulFill(parseInt(b).toString(16)),
    };
  }

  static parseBase10(input) {
    const parsedHex = `000000${(((input & 0xFF) << 16) + (input & 0xFF00) + ((input >> 16) & 0xFF)).toString(16)}`.slice(-6); // eslint-disable-line no-bitwise
    const hex = {
      r: this.fulFill(parsedHex.substring(0, 2)),
      g: this.fulFill(parsedHex.substring(2, 4)),
      b: this.fulFill(parsedHex.substring(4, 6)),
      parsed: this.fulFill(parsedHex.substring(0, 2)) + this.fulFill(parsedHex.substring(2, 4)) + this.fulFill(parsedHex.substring(4, 6)),
    };
    return {
      hex,
      rgb: this.hex2rgb(hex.r, hex.g, hex.b),
      hsl: this.hex2hsl(hex.r, hex.g, hex.b),
    };
  }

  static luminance(r, g, b) {
    return (0.299 * (r ** 2)) + (0.587 * (g ** 2)) + (0.114 * (b ** 2));
  }

  static hexConcat(r, g, b) {
    return `#${this.fulFill(r.toString(16))}${this.fulFill(g.toString(16))}${this.fulFill(b.toString(16))}`;
  }

  static fulFill(value, fill = 0, number = 2) {
    const length = value.toString().length;
    return `${fill.toString().repeat(number - length)}${value}`;
  }
}

exports.init = (client) => { client.ResolverColor = new ResolverColor(); };
