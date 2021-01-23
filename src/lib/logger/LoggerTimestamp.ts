import { Timestamp } from '@sapphire/time-utilities';
import { LoggerStyle, LoggerStyleResolvable } from './LoggerStyle';

/**
 * Logger utility that formats a timestamp.
 * @since 1.0.0
 */
export class LoggerTimestamp {
	/**
	 * The timestamp used to format the current date.
	 * @since 1.0.0
	 */
	public timestamp: Timestamp;

	/**
	 * Whether or not the logger will show a timestamp in UTC.
	 * @since 1.0.0
	 */
	public utc: boolean;

	/**
	 * The logger style to apply the color to the timestamp.
	 * @since 1.0.0
	 */
	public color: LoggerStyle | null;

	/**
	 * The final formatter.
	 * @since 1.0.0
	 */
	public formatter: LoggerTimestampFormatter;

	public constructor(options: LoggerTimestampOptions = {}) {
		this.timestamp = new Timestamp(options.pattern ?? 'YYYY-MM-DD HH:mm:ss');
		this.utc = options.utc ?? false;
		this.color = options.color === null ? null : new LoggerStyle(options.color);
		this.formatter = options.formatter ?? ((timestamp) => `${timestamp} - `);
	}

	/**
	 * Formats the current time.
	 * @since 1.0.0
	 */
	public run() {
		const date = new Date();
		const result = this.utc ? this.timestamp.displayUTC(date) : this.timestamp.display(date);
		return this.formatter(this.color ? this.color.run(result) : result);
	}
}

/**
 * The options for [[LoggerTimestamp]].
 * @since 1.0.0
 */
export interface LoggerTimestampOptions {
	/**
	 * The [[Timestamp]] pattern.
	 * @since 1.0.0
	 * @default 'YYYY-MM-DD HH:mm:ss'
	 * @example
	 * ```typescript
	 * 'YYYY-MM-DD HH:mm:ss'
	 * // 2020-12-23 22:01:10
	 * ```
	 */
	pattern?: string;

	/**
	 * Whether or not the date should be UTC.
	 * @since 1.0.0
	 * @default false
	 */
	utc?: boolean;

	/**
	 * The color to use.
	 * @since 1.0.0
	 * @default colorette.reset
	 */
	color?: LoggerStyleResolvable | null;

	/**
	 * The formatter. See [[LoggerTimestampFormatter]] for more information.
	 * @since 1.0.0
	 * @default (value) => `${value} - `
	 */
	formatter?: LoggerTimestampFormatter;
}

/**
 * The formatter used for [[LoggerTimestampOptions]]. This will be run **after** applying the color to the formatter.
 * @since 1.0.0
 */
export interface LoggerTimestampFormatter {
	/**
	 * @param timestamp The output of [[LoggerStyle.run]] on [[Timestamp.display]]/[[Timestamp.displayUTC]].
	 * @since 1.0.0
	 */
	(timestamp: string): string;
}
