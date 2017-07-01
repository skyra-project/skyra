const { luminance, hexConcat, validate: validateColor } = require("../../functions/resolveColor");
const { join, resolve } = require("path");
const Canvas = require("canvas");

Canvas.registerFont(resolve(join(__dirname, "../../assets/fonts/FiraSans-Regular.ttf")), { family: "FiraSans" });

/* Color limiter */
const cL = c => Math.max(Math.min(c, 255), 0);

const sCL = (c) => {
    if (c > 110) return 0;
    return 255;
};

const showColor = async (client, color, diff) => {
  /* Initialize canvas */
    const c = new Canvas(370, 390);
    const ctx = c.getContext("2d");

    const red = color.r;
    const green = color.g;
    const blue = color.b;

    let thisLum;
    ctx.font = "18px FiraSans";
    const colours = [
        { R: red + (diff * 2),
            G: green,
            B: blue,
            pos: [5, 5] },
        { R: red + diff,
            G: green + diff,
            B: blue,
            pos: [5, 125] },
        { R: red,
            G: green + (diff * 2),
            B: blue,
            pos: [5, 245] },
        { R: red + diff,
            G: green,
            B: blue + diff,
            pos: [125, 5] },
        { R: red,
            G: green,
            B: blue,
            pos: [125, 125] },
        { R: red - diff,
            G: green,
            B: blue - diff,
            pos: [125, 245] },
        { R: red,
            G: green,
            B: blue + (diff * 2),
            pos: [245, 5] },
        { R: red - diff,
            G: green - diff,
            B: blue,
            pos: [245, 125] },
        { R: red - (diff * 2),
            G: green - (diff * 2),
            B: blue - (diff * 2),
            pos: [245, 245] },
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
    ctx.font = "16px FiraSans";
    ctx.fillStyle = `rgb(${sCL(thisLum)}, ${sCL(thisLum)}, ${sCL(thisLum)})`;
    ctx.fillText(
    hexConcat(255 - red, 255 - green, 255 - blue),
    15,
    22 + 360,
  );

    return c.toBuffer();
};

exports.run = async (client, msg, [input, diff = 10]) => {
    const { hex, hsl, hsluv, rgb } = validateColor(input);

    const output = await showColor(client, rgb, diff);
    return msg.channel.send([
        `Color: **${hex.toString()}**`,
        `RGB: ${rgb.toString()}`,
        `HSL: ${hsl.toString()}`,
        `HSLᵤᵥ: ${hsluv.toString()}`,
    ].join("\n"), { files: [{ attachment: output, name: "color.png" }] });
};

exports.conf = {
    enabled: true,
    runIn: ["text", "dm", "group"],
    aliases: ["colour"],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 1,
    cooldown: 10,
};

exports.help = {
    name: "color",
    description: "Display some awesome colours.",
    usage: "<color:string> [separator:int{0,255}]",
    usageDelim: " >",
    extendedHelp: [
        "Hey! Do you want me to display a color?",
        "",
        "= Usage =",
        "Skyra, colour <Colour>",
        "Colour :: Hex code of the color you want displayed",
        "",
        "= Supported formats =",
        "HEX :: #RRGGBB",
        "RGB :: rgb(RRR, GGG, BBB)",
        "HSL :: hsl(HHH, SSS, LLL)",
        "HSLUV :: hsluv(HHH, SSS, LLL)",
        "BASE10 :: 0 - 16777215",
        "",
        "= Examples =",
        "Skyra, colour #ff73c1",
        "❯❯ I display a lot of info from this color.",
    ].join("\n"),
};
