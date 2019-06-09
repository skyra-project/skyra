import { CommandStore, KlasaMessage, Stopwatch, Type, util } from 'klasa';
import { transpileModule, TranspileOptions } from 'typescript';
import { inspect } from 'util';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { Events } from '../../../lib/types/Enums';
import { fetch } from '../../../lib/util/util';
import * as transpileOptions from '../../../../tsconfig.json';

// @ts-ignore
const tsTranspileOptions: TranspileOptions = { compilerOptions: transpileOptions.compilerOptions };

enum EvalLanguage {
	JavaScript,
	TypeScript
}

export default class extends SkyraCommand {

	private readonly timeout = 60000;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['ev'],
			description: language => language.get('COMMAND_EVAL_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_EVAL_EXTENDED'),
			guarded: true,
			permissionLevel: 10,
			usage: '<expression:str>',
			flagSupport: true
		});
	}

	public async run(message: KlasaMessage, [code]: [string]) {
		const flagTime = 'no-timeout' in message.flags ? 'wait' in message.flags ? Number(message.flags.wait) : this.timeout : Infinity;
		const language = message.flags.lang || message.flags.language || (message.flags.json ? 'json' : 'js');
		const languageType = this.getLanguageType(language);
		const { success, result, time, type } = await this.timedEval(message, code, flagTime, languageType);

		if (message.flags.silent) {
			if (!success && result && (result as unknown as Error).stack) this.client.emit(Events.Wtf, (result as unknown as Error).stack);
			return null;
		}

		const footer = util.codeBlock('ts', type);
		const sendAs = message.flags.output || message.flags['output-to'] || (message.flags.log ? 'log' : null);
		return this.handleMessage(message, { sendAs, hastebinUnavailable: false, url: null }, { success, result, time, footer, language });
	}

	private getLanguageType(language: string) {
		switch (language) {
			case 'typescript':
			case 'ts': return EvalLanguage.TypeScript;
			default: return EvalLanguage.JavaScript;
		}
	}

	private timedEval(message: KlasaMessage, code: string, flagTime: number, languageType: EvalLanguage) {
		if (flagTime === Infinity || flagTime === 0) return this.eval(message, code, languageType);
		return Promise.race([
			// eslint-disable-next-line promise/prefer-await-to-then
			util.sleep(flagTime).then(() => ({
				result: message.language.get('COMMAND_EVAL_TIMEOUT', flagTime / 1000),
				success: false,
				time: '⏱ ...',
				type: 'EvalTimeoutError'
			})),
			this.eval(message, code, languageType)
		]);
	}

	// Eval the input
	private async eval(message: KlasaMessage, code: string, languageType: EvalLanguage) {
		switch (languageType) {
			case EvalLanguage.TypeScript:
				return this.nativeEval(message, transpileModule(code, tsTranspileOptions).outputText);
			case EvalLanguage.JavaScript:
				return this.nativeEval(message, code);
		}
	}

	private async nativeEval(message: KlasaMessage, code: string) {
		const stopwatch = new Stopwatch();
		let success: boolean;
		let syncTime: string;
		let asyncTime: string;
		let result: any;
		let thenable = false;
		let type: Type;
		try {
			if (message.flags.async) code = `(async () => {\n${code}\n})();`;
			// @ts-ignore
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const msg = message;
			// eslint-disable-next-line no-eval
			result = eval(code);
			syncTime = stopwatch.toString();
			type = new Type(result);
			if (util.isThenable(result)) {
				thenable = true;
				stopwatch.restart();
				result = await result;
				asyncTime = stopwatch.toString();
			}
			success = true;
		} catch (error) {
			if (!syncTime!) syncTime = stopwatch.toString();
			if (thenable && !asyncTime!) asyncTime = stopwatch.toString();
			if (!type!) type = new Type(error);
			result = error;
			success = false;
		}

		stopwatch.stop();
		if (typeof result !== 'string') {
			result = result instanceof Error
				? result.stack
				: message.flags.json
					? JSON.stringify(result, null, 4)
					: inspect(result, {
						depth: message.flags.depth ? parseInt(message.flags.depth, 10) || 0 : 0,
						showHidden: Boolean(message.flags.showHidden)
					});
		}
		return { success, type: type!, time: this.formatTime(syncTime!, asyncTime!), result: util.clean(result) };
	}

	private formatTime(syncTime: string, asyncTime: string) {
		return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
	}

	private async getHaste(evalResult: string, language: string = 'js') {
		const { key } = await fetch('https://hasteb.in/documents', { method: 'POST', body: evalResult }, 'json');
		return `https://hasteb.in/${key}.${language}`;
	}

	private async handleMessage(message: KlasaMessage, options: InternalEvalOptions, { success, result, time, footer, language }: InternalEvalResults) {
		switch (options.sendAs) {
			case 'file': {
				if (message.channel.attachable) return message.channel.sendFile(Buffer.from(result), 'output.txt', message.language.get('COMMAND_EVAL_OUTPUT_FILE', time, footer));
				await this.getTypeOutput(message, options);
				return this.handleMessage(message, options, { success, result, time, footer, language });
			}
			case 'haste':
			case 'hastebin': {
				if (!options.url) options.url = await this.getHaste(result, language).catch(() => null);
				if (options.url) return message.sendLocale('COMMAND_EVAL_OUTPUT_HASTEBIN', [time, options.url, footer]);
				options.hastebinUnavailable = true;
				await this.getTypeOutput(message, options);
				return this.handleMessage(message, options, { success, result, time, footer, language });
			}
			case 'console':
			case 'log': {
				this.client.emit(Events.Log, result);
				return message.sendLocale('COMMAND_EVAL_OUTPUT_CONSOLE', [time, footer]);
			}
			case 'abort':
			case 'none':
				return null;
			default: {
				if (result.length > 2000) {
					await this.getTypeOutput(message, options);
					return this.handleMessage(message, options, { success, result, time, footer, language });
				}
				return message.sendMessage(message.language.get(success ? 'COMMAND_EVAL_OUTPUT' : 'COMMAND_EVAL_ERROR',
					time, util.codeBlock(language, result), footer));
			}
		}
	}

	private async getTypeOutput(message: KlasaMessage, options: InternalEvalOptions) {
		const _options = ['none', 'abort', 'log'];
		if (message.channel.attachable) _options.push('file');
		if (!options.hastebinUnavailable) _options.push('hastebin');
		let _choice: { content: string };
		do {
			_choice = await message.prompt(`Choose one of the following options: ${_options.join(', ')}`).catch(() => ({ content: 'none' }));
		}
		while (!_options.concat('none', 'abort').includes(_choice.content));
		options.sendAs = _choice.content.toLowerCase();
	}

}

interface InternalEvalResults {
	success: boolean;
	result: any;
	time: string;
	footer: string;
	language: string;
}

interface InternalEvalOptions {
	sendAs: string | null;
	hastebinUnavailable: boolean;
	url: string | null;
}
