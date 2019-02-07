import { outputFileAtomic } from 'fs-nextra';
import { Client, CommandStore, KlasaMessage, Stopwatch, Type, util } from 'klasa';
import { join } from 'path';
import { ScriptTarget, transpileModule, TranspileOptions } from 'typescript';
import { inspect } from 'util';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { Events } from '../../../lib/types/Enums';
import { fetch } from '../../../lib/util/util';
import { rootFolder } from '../../../Skyra';

const tsTranspileOptions: TranspileOptions = { compilerOptions: { allowJs: true, checkJs: true, target: ScriptTarget.ESNext } };

const BWD_FOLDER = join(rootFolder, 'bwd');
const CS_FILE = join(BWD_FOLDER, 'cs', 'eval.cs');
const CS_EXEC = join(BWD_FOLDER, 'cs', 'eval.exe');
const CPP_FILE = join(BWD_FOLDER, 'cpp', 'eval.cpp');
const CPP_EXEC = join(BWD_FOLDER, 'cpp', 'eval.exe');

export default class extends SkyraCommand {

	private readonly timeout = 60000;

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['ev'],
			description: (language) => language.get('COMMAND_EVAL_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_EVAL_EXTENDED'),
			guarded: true,
			permissionLevel: 10,
			usage: '<expression:str>'
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
			case 'csharp':
			case 'c#':
			case 'cs': return EvalLanguage.CSharp;
			case 'cplusplus':
			case 'c++':
			case 'cpp': return EvalLanguage.CPlusPlus;
			case 'typescript':
			case 'ts': return EvalLanguage.TypeScript;
			default: return EvalLanguage.JavaScript;
		}
	}

	private timedEval(message: KlasaMessage, code: string, flagTime: number, languageType: EvalLanguage) {
		if (flagTime === Infinity || flagTime === 0) return this.eval(message, code, languageType);
		return Promise.race([
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
			default:
				return this.foreignEval(message, code, languageType);
		}
	}

	private async nativeEval(message: KlasaMessage, code: string) {
		const stopwatch = new Stopwatch();
		let success: boolean, syncTime: string, asyncTime: string, result: any;
		let thenable = false;
		let type;
		try {
			if (message.flags.async) code = `(async () => {\n${code}\n})();`;
			// @ts-ignore
			const msg = message;
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
			if (!syncTime) syncTime = stopwatch.toString();
			if (thenable && !asyncTime) asyncTime = stopwatch.toString();
			if (!type) type = new Type(error);
			result = error;
			success = false;
		}

		stopwatch.stop();
		if (typeof result !== 'string') {
			result = result instanceof Error ? result.stack : message.flags.json ? JSON.stringify(result, null, 4) : inspect(result, {
				depth: message.flags.depth ? parseInt(message.flags.depth) || 0 : 0,
				showHidden: Boolean(message.flags.showHidden)
			});
		}
		return { success, type, time: this.formatTime(syncTime, asyncTime), result: util.clean(result) };
	}

	private async foreignEval(message: KlasaMessage, code: string, languageType: EvalLanguage) {
		const controller = FOREIGN_CONTROLLERS[languageType];
		const stopwatch = new Stopwatch();

		try {
			const preprocessed = await controller.before(code);

			stopwatch.reset();
			try {
				const evaluated = await controller.evaluate(message, preprocessed);
				const time = this.formatTime(stopwatch.toString(), null);
				const { type, value } = controller.extract(evaluated);
				return { success: true, type, time, result: value };
			} catch (error) {
				return { success: false, type: 'Error', time: this.formatTime(stopwatch.toString(), null), result: String(error) };
			}
		} catch (error) {
			return { success: false, type: 'CompilerError', time: this.formatTime(stopwatch.toString(), null), result: String(error) };
		}
	}

	private formatTime(syncTime: string, asyncTime: string) {
		return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
	}

	private async getHaste(evalResult: string, language: string = 'js') {
		const { key } = await fetch('https://hastebin.com/documents', { method: 'POST', body: evalResult }, 'json');
		return `https://hastebin.com/${key}.${language}`;
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
		let _choice;
		do
			_choice = await message.prompt(`Choose one of the following options: ${_options.join(', ')}`).catch(() => ({ content: 'none' }));
		while (!['file', 'haste', 'hastebin', 'console', 'log', 'default', 'none', 'abort', null].includes(_choice.content));
		options.sendAs = _choice.content.toLowerCase();
	}

}

interface ForeignController {
	before(code: string): string | Promise<string>;
	evaluate(message: KlasaMessage, code: string): unknown;
	extract(output: unknown): {
		type: string;
		value: string;
	};
}

interface InternalEvalResults {
	success: boolean;
	result: any;
	time: string;
	footer: string;
	language: string;
}

interface InternalEvalOptions {
	sendAs: string;
	hastebinUnavailable: boolean;
	url: string;
}

enum EvalLanguage {
	JavaScript,
	TypeScript,
	CSharp,
	CPlusPlus
}

const templates = new Map([
	[EvalLanguage.CSharp, (code: string) => `
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

class Program
{
    static void Main(string[] args)
    {
		var input = Execute();
		Console.WriteLine(input == null ? null : input.GetType().FullName);

		if (input is string)
        {
            Console.WriteLine(input);
        }
        else if (input != null)
        {
            Console.WriteLine(input.ToString());
        }
    }

    static object Execute()
    {
        ${code}
    }
}
	`],
	[EvalLanguage.CPlusPlus, (code: string) => `
#include <iostream>
#include <string>
#include <typeinfo>
#include <vector>
#include <cxxabi.h>
using namespace std;

int main()
{
	${code}
	cout << abi::__cxa_demangle(typeid(foo).name(), 0, 0, 0);
	cout << __v;
    return 0;
}
    `]
]);

const FOREIGN_CONTROLLERS: Record<EvalLanguage, ForeignController> = {
	[EvalLanguage.JavaScript]: {
		before(code: string) { return code; },
		evaluate() { return null; },
		extract() { return null; }
	},
	[EvalLanguage.TypeScript]: {
		before(code: string) { return code; },
		evaluate() { return null; },
		extract() { return null; }
	},
	[EvalLanguage.CSharp]: {
		async before(code: string) {
			const output = templates.get(EvalLanguage.CSharp)(/return/.test(code) ? code : `${code}\n\t\treturn null;`);
			await outputFileAtomic(CS_FILE, output);
			await util.exec(`csc ${CS_FILE}`);
			return output;
		},
		async evaluate() {
			return (await util.exec(`mono ${CS_EXEC}`)).stdout;
		},
		extract(output: string) {
			const [type, ...rest] = output.split('\n');
			return { type, value: rest.join('\n') };
		}
	},
	[EvalLanguage.CPlusPlus]: {
		async before(code: string) {
			const output = templates.get(EvalLanguage.CPlusPlus)(code.replace(/return (.+)/, 'auto __v = $1;'));
			await outputFileAtomic(CPP_FILE, code);
			await util.exec(`g++ ${CPP_FILE} -o ${CPP_EXEC} -Wall -Wextra`);
			return output;
		},
		async evaluate() {
			return (await util.exec(CPP_EXEC)).stdout;
		},
		extract(output: string) {
			const [type, ...rest] = output.split('\n');
			return { type, value: rest.join('\n') };
		}
	}
};
