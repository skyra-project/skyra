import type { CommandContext } from '@sapphire/framework';
import type { Message } from 'discord.js';
import type { SkyraArgs } from '../parsers';
import type { SkyraCommand } from '../SkyraCommand';

export abstract class SubCommandEntry {
	public readonly input: string;
	public readonly output: string;

	public constructor(options: SubCommandEntry.Options) {
		this.input = options.input;
		this.output = options.output ?? options.input;
	}

	public match(value: string): boolean {
		return value === this.input;
	}

	public abstract run(context: SubCommandEntry.RunContext): unknown;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace SubCommandEntry {
	export interface Options {
		input: string;
		output?: string;
	}

	export interface RunContext {
		command: SkyraCommand;
		message: Message;
		args: SkyraArgs;
		context: CommandContext;
	}
}
