import { RGB } from '#lib/structures/color';
import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { hexConcat, luminance, parse } from '#utils/Color';
import { Canvas, rgb } from 'canvas-constructor';
import { CommandStore, KlasaMessage } from 'klasa';

/* Color limiter */
const rL = (color: number) => color / 255;
const cL = (color: number) => Math.max(Math.min(color, 255), 0);
const sCL = (color: number) => (color >= 0.5 ? 0 : 255);

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['colour'],
			cooldown: 15,
			description: (language) => language.get(LanguageKeys.Commands.Tools.ColorDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Tools.ColorExtended),
			requiredPermissions: ['ATTACH_FILES'],
			usage: '<color:string> [separator:integer{0,255}]',
			usageDelim: ' >'
		});
	}

	public async run(message: KlasaMessage, [input, diff = 10]: [string, number]) {
		const { hex, hsl, rgb } = parse(input);

		const attachment = await this.showColor(rgb, diff);
		return message.sendLocale(
			LanguageKeys.Commands.Tools.Color,
			[
				{
					hex: hex.toString(),
					rgb: rgb.toString(),
					hsl: hsl.toString()
				}
			],
			{
				files: [{ attachment, name: 'color.png' }]
			}
		);
	}

	public async showColor(color: RGB, diff: number) {
		const red = color.r;
		const green = color.g;
		const blue = color.b;

		const canvas = new Canvas(370, 390).setTextFont('18px FiraSans');

		this.processFrame(canvas, 5, 5, cL(red + diff * 2), cL(green), cL(blue));
		this.processFrame(canvas, 5, 125, cL(red + diff), cL(green + diff), cL(blue));
		this.processFrame(canvas, 5, 245, cL(red), cL(green + diff * 2), cL(blue));
		this.processFrame(canvas, 125, 5, cL(red + diff), cL(green), cL(blue + diff));
		this.processFrame(canvas, 125, 125, cL(red), cL(green), cL(blue));
		this.processFrame(canvas, 125, 245, cL(red - diff), cL(green), cL(blue - diff));
		this.processFrame(canvas, 245, 5, cL(red), cL(green), cL(blue + diff * 2));
		this.processFrame(canvas, 245, 125, cL(red - diff), cL(green - diff), cL(blue));
		this.processFrame(canvas, 245, 245, cL(red - diff * 2), cL(green - diff * 2), cL(blue - diff * 2));

		/* Complementary */
		const thisLum = sCL(luminance(rL(255 - red), rL(255 - green), rL(255 - blue)));
		return canvas
			.setColor(rgb(255 - red, 255 - green, 255 - blue))
			.printRectangle(5, 365, 360, 20)
			.setTextFont('16px FiraSans')
			.setColor(rgb(thisLum, thisLum, thisLum))
			.printText(hexConcat(255 - red, 255 - green, 255 - blue), 15, 382)
			.toBufferAsync();
	}

	public processFrame(ctx: Canvas, x: number, y: number, red: number, green: number, blue: number) {
		const lum = luminance(rL(red), rL(green), rL(blue));
		const textColor = sCL(lum);

		return ctx
			.setColor(rgb(red, green, blue))
			.printRectangle(x, y, 120, 120)
			.setColor(rgb(textColor, textColor, textColor))
			.printText(hexConcat(red, green, blue), x + 10, y + 20);
	}
}
