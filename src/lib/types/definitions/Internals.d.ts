import { Monitor, KlasaMessage } from 'klasa';

export interface CommandHandler extends Monitor {
	run(message: KlasaMessage): Promise<void>;
	parseCommand(message: KlasaMessage): CommandHandlerParseResultOk | CommandHandlerParseResultError;
	customPrefix(message: KlasaMessage): CommandHandlerPrefix | null;
	mentionPrefix(message: KlasaMessage): CommandHandlerPrefix | null;
	naturalPrefix(message: KlasaMessage): CommandHandlerPrefix | null;
	prefixLess(message: KlasaMessage): CommandHandlerPrefix | null;
	generateNewPrefix(prefix: string): CommandHandlerPrefix;
	runCommand(message: KlasaMessage): Promise<void>;
	init(): Promise<void>;
}

export interface CommandHandlerParseResultOk {
	commandText: string;
	prefix: RegExp;
	prefixLength: number;
}

export interface CommandHandlerParseResultError {
	commandText: false;
}

export interface CommandHandlerPrefix {
	length: number;
	regex: RegExp;
}
