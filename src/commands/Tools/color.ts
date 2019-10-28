import { Canvas } from 'canvas-constructor';
import { CommandStore, KlasaMessage } from 'klasa';
import { RGB } from '../../lib/structures/color';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { parse, luminance, hexConcat } from '../../lib/util/Color';

/* Color limiter */
const cL = (color: number) => Math.max(Math.min(color, 255), 0);
const sCL = (color: number) => color >= 128 ? 0 : 255;

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['colour'],
			cooldown: 15,
			description: language => language.tget('COMMAND_COLOR_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_COLOR_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			usage: '<color:string> [separator:integer{0,255}]',
			usageDelim: ' >'
		});
	}

	public async run(message: KlasaMessage, [input, diff = 10]: [string, number]) {
		const { hex, hsl, rgb } = parse(input);

		const attachment = await this.showColor(rgb, diff);
		return message.channel.send(message.language.tget('COMMAND_COLOR', hex.toString(), rgb.toString(), hsl.toString()), { files: [{ attachment, name: 'color.png' }] });
	}

	public async showColor(color: RGB, diff: number) {
		const red = color.r;
		const green = color.g;
		const blue = color.b;

		const canvas = new Canvas(370, 390)
			.setTextFont('18px FiraSans');

		this.processFrame(canvas.context, 5, 5, cL(red + (diff * 2)), cL(green), cL(blue));
		this.processFrame(canvas.context, 5, 125, cL(red + diff), cL(green + diff), cL(blue));
		this.processFrame(canvas.context, 5, 245, cL(red), cL(green + (diff * 2)), cL(blue));
		this.processFrame(canvas.context, 125, 5, cL(red + diff), cL(green), cL(blue + diff));
		this.processFrame(canvas.context, 125, 125, cL(red), cL(green), cL(blue));
		this.processFrame(canvas.context, 125, 245, cL(red - diff), cL(green), cL(blue - diff));
		this.processFrame(canvas.context, 245, 5, cL(red), cL(green), cL(blue + (diff * 2)));
		this.processFrame(canvas.context, 245, 125, cL(red - diff), cL(green - diff), cL(blue));
		this.processFrame(canvas.context, 245, 245, cL(red - (diff * 2)), cL(green - (diff * 2)), cL(blue - (diff * 2)));

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

	public processFrame(ctx: CanvasRenderingContext2D, x: number, y: number, red: number, green: number, blue: number) {
		ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
		ctx.fillRect(x, y, 120, 120);
		const thisLum = sCL(luminance(red, green, blue));
		ctx.fillStyle = `rgb(${thisLum}, ${thisLum}, ${thisLum})`;
		ctx.fillText(
			hexConcat(red, green, blue),
			10 + x,
			20 + y
		);
	}

}
