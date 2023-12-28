import { Args, Result, UserError, type MessageCommand } from '@sapphire/framework';
import { ArgumentStream, Parser } from '@sapphire/lexure';
import type { TFunction } from '@sapphire/plugin-i18next';
import type { Message } from 'discord.js';

export class SkyraArgs extends Args {
	public override t: TFunction;

	public constructor(message: Message, command: MessageCommand, parser: ArgumentStream, context: MessageCommand.RunContext, t: TFunction) {
		super(message, command, parser, context);
		this.t = t;
	}

	/**
	 * Consumes the entire parser and splits it by the delimiter, filtering out empty values.
	 * @param delimiter The delimiter to be used, defaults to `,`.
	 * @returns An array of values.
	 */
	public nextSplitResult({ delimiter = ',', times = Infinity }: SkyraArgs.NextSplitOptions = {}): Result<string[], UserError> {
		if (this.parser.finished) return this.missingArguments();

		const values: string[] = [];
		const parts = this.parser.many();
		if (parts.isNone()) return this.missingArguments();

		const tokens = parts
			.unwrap()
			.reduce((acc, token) => `${acc}${token.leading}${token.value}`, '')
			.split(delimiter);
		for (const part of tokens) {
			const trimmed = part.trim();
			if (trimmed.length === 0) continue;

			values.push(trimmed);
			if (values.length === times) break;
		}

		return values.length > 0 ? Args.ok(values) : this.missingArguments();
	}

	/**
	 * Consumes the entire parser and splits it by the delimiter, filtering out empty values.
	 * @param delimiter The delimiter to be used, defaults to `,`.
	 * @returns An array of values.
	 */
	public nextSplit(options?: SkyraArgs.NextSplitOptions) {
		return this.nextSplitResult(options).unwrapRaw();
	}

	public static from(command: MessageCommand, message: Message, parameters: string, context: MessageCommand.RunContext, t: TFunction) {
		const parser = new Parser(command.strategy);
		// eslint-disable-next-line @typescript-eslint/dot-notation
		const args = new ArgumentStream(parser.run(command['lexer'].run(parameters)));
		return new SkyraArgs(message, command, args, context, t);
	}
}

export namespace SkyraArgs {
	export interface NextSplitOptions {
		/**
		 * The delimiter to be used.
		 * @default ','
		 */
		delimiter?: string;

		/**
		 * The maximum amount of entries to be read.
		 * @default Infinity
		 */
		times?: number;
	}
}

declare module '@sapphire/framework' {
	export interface Args {
		t: TFunction;
	}
}
