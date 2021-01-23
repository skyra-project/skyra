import { bgRed, cyan, gray, magenta, options as coloretteOptions, red, Style, white, yellow } from 'colorette';
import { Console } from 'console';
import { Logger as BuiltinLogger, LogLevel, LogMethods } from 'klasa';
import { inspect, InspectOptions } from 'util';
import { LoggerLevel, LoggerLevelOptions } from './LoggerLevel';

/**
 * The logger class.
 * @since 1.0.0
 */
export class Logger extends BuiltinLogger {
	/**
	 * The console this writes to.
	 * @since 1.0.0
	 */
	public readonly console: Console;

	/**
	 * The formats supported by the logger.
	 * @since 1.0.0
	 */
	public readonly formats: Map<LogLevel, LoggerLevel>;

	/**
	 * The string `write` will join values by.
	 * @since 1.0.0
	 */
	public readonly join: string;

	/**
	 * The inspect depth when logging objects.
	 * @since 1.0.0
	 */
	public readonly depth: number;

	public constructor(options: LoggerOptions = {}) {
		super(options.level ?? LogLevel.Info);

		this.console = new Console(options.stdout ?? process.stdout, options.stderr ?? process.stderr);
		this.formats = Logger.createFormatMap(options.format, options.defaultFormat);
		this.join = options.join ?? ' ';
		this.depth = options.depth ?? 0;

		if (typeof options.stylize === 'boolean') Logger.stylize = options.stylize;
	}

	/**
	 * Writes the log message given a level and the value(s).
	 * @param level The log level.
	 * @param values The values to log.
	 */
	public write(level: LogLevel, ...values: readonly unknown[]): void {
		if (level < this.level) return;

		const method = this.levels.get(level) ?? 'log';
		const formatter = this.formats.get(level) ?? this.formats.get(LogLevel.None)!;

		this.console[method](formatter.run(this.preprocess(values)));
	}

	public info(...values: readonly unknown[]): void {
		this.write(LogLevel.Info, ...values);
	}

	public warn(...values: readonly unknown[]): void {
		this.write(LogLevel.Warn, ...values);
	}

	public error(...values: readonly unknown[]): void {
		this.write(LogLevel.Error, ...values);
	}

	public fatal(...values: readonly unknown[]): void {
		this.write(LogLevel.Fatal, ...values);
	}

	public trace(...values: readonly unknown[]): void {
		this.write(LogLevel.Trace, ...values);
	}

	public debug(...values: readonly unknown[]): void {
		this.write(LogLevel.Debug, ...values);
	}

	/**
	 * Pre-processes an array of values.
	 * @since 1.0.0
	 * @param values The values to pre-process.
	 */
	protected preprocess(values: readonly unknown[]) {
		const inspectOptions: InspectOptions = { colors: coloretteOptions.enabled, depth: this.depth };
		return values.map((value) => (typeof value === 'string' ? value : inspect(value, inspectOptions))).join(this.join);
	}

	private get levels() {
		return Reflect.get(BuiltinLogger, 'levels') as Map<LogLevel, LogMethods>;
	}

	/**
	 * Gets whether or not colorette is enabled.
	 * @since 1.0.0
	 */
	public static get stylize() {
		return coloretteOptions.enabled;
	}

	/**
	 * Sets whether or not colorette should be enabled.
	 * @since 1.0.0
	 */
	public static set stylize(value: boolean) {
		coloretteOptions.enabled = value;
	}

	private static createFormatMap(options: LoggerFormatOptions = {}, defaults: LoggerLevelOptions = options.none ?? {}) {
		return new Map<LogLevel, LoggerLevel>([
			[LogLevel.Trace, Logger.ensureDefaultLevel(options.trace, defaults, gray, 'TRACE')],
			[LogLevel.Debug, Logger.ensureDefaultLevel(options.debug, defaults, magenta, 'DEBUG')],
			[LogLevel.Info, Logger.ensureDefaultLevel(options.info, defaults, cyan, 'INFO')],
			[LogLevel.Warn, Logger.ensureDefaultLevel(options.warn, defaults, yellow, 'WARN')],
			[LogLevel.Error, Logger.ensureDefaultLevel(options.error, defaults, red, 'ERROR')],
			[LogLevel.Fatal, Logger.ensureDefaultLevel(options.fatal, defaults, bgRed, 'FATAL')],
			[LogLevel.None, Logger.ensureDefaultLevel(options.none, defaults, white, '')]
		]);
	}

	private static ensureDefaultLevel(options: LoggerLevelOptions | undefined, defaults: LoggerLevelOptions, color: Style, name: string) {
		if (options) return new LoggerLevel(options);
		return new LoggerLevel({
			...defaults,
			timestamp: defaults.timestamp === null ? null : { ...(defaults.timestamp ?? {}), color },
			infix: name.length ? `${color(name.padEnd(5, ' '))} - ` : ''
		});
	}
}

/**
 * The logger options.
 * @since 1.0.0
 */
export interface LoggerOptions {
	/**
	 * The WriteStream for the output logs.
	 * @since 1.0.0
	 * @default process.stdout
	 */
	stdout?: NodeJS.WriteStream;

	/**
	 * A WriteStream for the error logs.
	 * @since 1.0.0
	 * @default process.stderr
	 */
	stderr?: NodeJS.WriteStream;

	/**
	 * The default options used to fill all the possible values for [[LoggerOptions.format]].
	 * @since 1.0.0
	 * @default options.format.none ?? {}
	 */
	defaultFormat?: LoggerLevelOptions;

	/**
	 * The options for each log level. LogLevel.None serves to set the default for all keys, where only
	 * [[LoggerTimestampOptions.timestamp]] and [[LoggerLevelOptions.prefix]] would be overridden.
	 * @since 1.0.0
	 * @default {}
	 */
	format?: LoggerFormatOptions;

	/**
	 * The minimum log level.
	 * @since 1.0.0
	 * @default LogLevel.Info
	 */
	level?: LogLevel;

	/**
	 * The string that joins different messages.
	 * @since 1.0.0
	 * @default ' '
	 */
	join?: string;

	/**
	 * Whether or not styles should be applied, this modifies colorette's global options. For specific ones, use `null`
	 * in the style options. Alternatively, you can set a boolean to [[Logger.stylize]] to change this setting anytime.
	 * @since 1.0.0
	 */
	stylize?: boolean;

	/**
	 * The inspect depth when logging objects.
	 * @since 1.0.0
	 * @default 0
	 */
	depth?: number;
}

/**
 * The logger format options.
 * @since 1.0.0
 */
export interface LoggerFormatOptions {
	/**
	 * The logger options for the lowest log level, used when calling [[ILogger.trace]].
	 * @since 1.0.0
	 */
	trace?: LoggerLevelOptions;

	/**
	 * The logger options for the debug level, used when calling [[ILogger.debug]].
	 * @since 1.0.0
	 */
	debug?: LoggerLevelOptions;

	/**
	 * The logger options for the info level, used when calling [[ILogger.info]].
	 * @since 1.0.0
	 */
	info?: LoggerLevelOptions;

	/**
	 * The logger options for the warning level, used when calling [[ILogger.warn]].
	 * @since 1.0.0
	 */
	warn?: LoggerLevelOptions;

	/**
	 * The logger options for the error level, used when calling [[ILogger.error]].
	 * @since 1.0.0
	 */
	error?: LoggerLevelOptions;

	/**
	 * The logger options for the critical level, used when calling [[ILogger.fatal]].
	 * @since 1.0.0
	 */
	fatal?: LoggerLevelOptions;

	/**
	 * The logger options for an unknown or uncategorized level.
	 * @since 1.0.0
	 */
	none?: LoggerLevelOptions;
}
