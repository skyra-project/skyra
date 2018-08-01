const { Command, Color: { parse, luminance, hexConcat } } = require('../../index');
const { Canvas } = require('canvas-constructor');

/* Color limiter */
const cL = colour => Math.max(Math.min(colour, 255), 0);
const sCL = (colour) => colour >= 128 ? 0 : 255;

/* eslint id-length: ["error", { "exceptions": ["c", "R", "G", "B", "x", "y"] }] */
module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['colour'],
			requiredPermissions: ['ATTACH_FILES'],
			cooldown: 15,
			description: (language) => language.get('COMMAND_COLOR_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_COLOR_EXTENDED'),
			usage: '<color:string> [separator:integer{0,255}]',
			usageDelim: ' >'
		});
	}

	async run(msg, [input, diff = 10]) {
		const { hex, hsl, rgb } = parse(input);

		const attachment = await this.showColor(rgb, diff);
		return msg.channel.send(msg.language.get('COMMAND_COLOR', hex, rgb, hsl), { files: [{ attachment, name: 'color.png' }] });
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
