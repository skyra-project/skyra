import type { SkyraCommand } from '#lib/structures';
import { Args, CommandContext, isOk, Result, UserError } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { TFunction } from 'i18next';
import type { Args as LexureArgs } from 'lexure';

export class SkyraArgs extends Args {
	public t: TFunction;

	public constructor(message: Message, command: SkyraCommand, parser: LexureArgs, context: CommandContext, t: TFunction) {
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
		const parts = this.parser
			.many()
			.reduce((acc, token) => `${acc}${token.value}${token.trailing}`, '')
			.split(delimiter);

		for (const part of parts) {
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
		const result = this.nextSplitResult(options);
		if (isOk(result)) return result.value;
		throw result.error;
	}
}

export interface SkyraArgs {
	command: SkyraCommand;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
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
