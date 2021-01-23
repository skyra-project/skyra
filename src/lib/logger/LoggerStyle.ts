import * as Colorette from 'colorette';

/**
 * Logger utility that applies a style to a string.
 * @since 1.0.0
 */
export class LoggerStyle {
	public readonly style: Colorette.Style;

	public constructor(resolvable: LoggerStyleResolvable = {}) {
		if (typeof resolvable === 'function') {
			this.style = resolvable;
		} else {
			const styles: Colorette.Style[] = [];
			if (resolvable.effects) styles.push(...resolvable.effects.map((text) => Colorette[text]));
			if (resolvable.text) styles.push(Colorette[resolvable.text]);
			if (resolvable.background) styles.push(Colorette[resolvable.background]);

			this.style = styles.length
				? styles.length === 1
					? styles[0]
					: (string) => styles.reduce((out, style) => style(out), string)
				: Colorette.reset;
		}
	}

	/**
	 * Applies the style to a string.
	 * @since 1.0.0
	 * @param string The value to apply the style to.
	 */
	public run(string: string) {
		return this.style(string);
	}
}

/**
 * The options for [[LoggerStyle]].
 * @since 1.0.0
 */
export interface LoggerStyleOptions {
	/**
	 * The text effects, e.g. `italic`, `strikethrough`, etc.
	 * @since 1.0.0
	 */
	effects?: LoggerStyleEffect[];

	/**
	 * The text color, e.g. `red` or `yellow`.
	 * @since 1.0.0
	 */
	text?: LoggerStyleText;

	/**
	 * The background color, e.g. `magenta` or `red`.
	 * @since 1.0.0
	 */
	background?: LoggerStyleBackground;
}

/**
 * The value accepted by [[LoggerStyle]]'s constructor. Read `colorette`'s documentation for more information.
 * @since 1.0.0
 * @seealso https://www.npmjs.com/package/colorette
 */
export type LoggerStyleResolvable = Colorette.Style | LoggerStyleOptions;

/**
 * The text styles.
 * @since 1.0.0
 */
export const enum LoggerStyleEffect {
	Reset = 'reset',
	Bold = 'bold',
	Dim = 'dim',
	Italic = 'italic',
	Underline = 'underline',
	Inverse = 'inverse',
	Hidden = 'hidden',
	Strikethrough = 'strikethrough'
}

/**
 * The text colors.
 * @since 1.0.0
 */
export const enum LoggerStyleText {
	Black = 'black',
	Red = 'red',
	Green = 'green',
	Yellow = 'yellow',
	Blue = 'blue',
	Magenta = 'magenta',
	Cyan = 'cyan',
	White = 'white',
	Gray = 'gray',
	BlackBright = 'blackBright',
	RedBright = 'redBright',
	GreenBright = 'greenBright',
	YellowBright = 'yellowBright',
	BlueBright = 'blueBright',
	MagentaBright = 'magentaBright',
	CyanBright = 'cyanBright',
	WhiteBright = 'whiteBright'
}

/**
 * The background colors.
 * @since 1.0.0
 */
export const enum LoggerStyleBackground {
	Black = 'bgBlack',
	Red = 'bgRed',
	Green = 'bgGreen',
	Yellow = 'bgYellow',
	Blue = 'bgBlue',
	Magenta = 'bgMagenta',
	Cyan = 'bgCyan',
	White = 'bgWhite',
	BlackBright = 'bgBlackBright',
	RedBright = 'bgRedBright',
	GreenBright = 'bgGreenBright',
	YellowBright = 'bgYellowBright',
	BlueBright = 'bgBlueBright',
	MagentaBright = 'bgMagentaBright',
	CyanBright = 'bgCyanBright',
	WhiteBright = 'bgWhiteBright'
}
