import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { seconds } from '#utils/common';
import { EvalExtraData, handleMessage } from '#utils/Parsers/ExceededLength';
import { clean } from '#utils/Sanitizer/clean';
import { cast } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Stopwatch } from '@sapphire/stopwatch';
import { Type } from '@sapphire/type';
import { codeBlock, isThenable } from '@sapphire/utilities';
import type { Message } from 'discord.js';
import { setTimeout as sleep } from 'node:timers/promises';
import { inspect } from 'node:util';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['ev'],
	description: LanguageKeys.Commands.System.EvalDescription,
	detailedDescription: LanguageKeys.Commands.System.EvalExtended,
	flags: ['async', 'no-timeout', 'json', 'silent', 'log', 'showHidden', 'hidden', 'sql'],
	options: ['wait', 'lang', 'language', 'output', 'output-to', 'depth'],
	permissionLevel: PermissionLevels.BotOwner,
	quotes: []
})
export class UserCommand extends SkyraCommand {
	private readonly kTimeout = 60000;

	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const code = await args.rest('string');

		const wait = args.getOption('wait');
		const flagTime = args.getFlags('no-timeout') ? (wait === null ? this.kTimeout : Number(wait)) : Infinity;
		const language = args.getOption('lang', 'language') ?? (args.getFlags('json') ? 'json' : 'js');
		const executeSql = args.getFlags('sql');
		const { success, result, time, type } = executeSql ? await this.sql(code) : await this.timedEval(message, args, code, flagTime);

		if (args.getFlags('silent')) {
			if (!success && result && cast<Error>(result).stack) this.container.logger.fatal(cast<Error>(result).stack);
			return null;
		}

		const footer = executeSql ? undefined : codeBlock('ts', type as string);
		const sendAs = args.getOption('output', 'output-to') ?? (args.getFlags('log') ? 'log' : null);

		return handleMessage<Partial<EvalExtraData>>(message, {
			sendAs,
			hastebinUnavailable: false,
			url: null,
			canLogToConsole: true,
			success,
			result,
			time,
			footer,
			language
		});
	}

	private async timedEval(message: Message, args: SkyraCommand.Args, code: string, flagTime: number) {
		if (flagTime === Infinity || flagTime === 0) return this.eval(message, args, code);
		return Promise.race([
			sleep(flagTime).then(() => ({
				result: args.t(LanguageKeys.Commands.System.EvalTimeout, { seconds: seconds.fromMilliseconds(flagTime) }),
				success: false,
				time: '⏱ ...',
				type: 'EvalTimeoutError'
			})),
			this.eval(message, args, code)
		]);
	}

	// Eval the input
	private async eval(message: Message, args: SkyraCommand.Args, code: string) {
		const stopwatch = new Stopwatch();
		let success: boolean;
		let syncTime = '';
		let asyncTime = '';
		let result: unknown;
		let thenable = false;
		let type: Type;

		try {
			if (args.getFlags('async')) code = `(async () => {\n${code}\n})();`;

			// @ts-expect-error value is never read, this is so `msg` is possible as an alias when sending the eval.
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const msg = message;
			// eslint-disable-next-line no-eval
			result = eval(code);
			syncTime = stopwatch.toString();
			type = new Type(result);
			if (isThenable(result)) {
				thenable = true;
				stopwatch.restart();
				result = await result;
				asyncTime = stopwatch.toString();
			}
			success = true;
		} catch (error) {
			if (!syncTime.length) syncTime = stopwatch.toString();
			if (thenable && !asyncTime.length) asyncTime = stopwatch.toString();
			if (!type!) type = new Type(error);
			result = error;
			success = false;
		}

		stopwatch.stop();
		if (typeof result !== 'string') {
			result =
				result instanceof Error
					? result.stack
					: args.getFlags('json')
					? JSON.stringify(result, null, 4)
					: inspect(result, {
							depth: Number(args.getOption('depth') ?? 0) || 0,
							showHidden: args.getFlags('showHidden', 'hidden')
					  });
		}
		return {
			success,
			type: type!,
			time: this.formatTime(syncTime, asyncTime ?? ''),
			result: clean(result as string)
		};
	}

	private async sql(sql: string) {
		const stopwatch = new Stopwatch();
		let success: boolean;
		let time: string;
		let result: unknown;
		let type: Type;

		try {
			result = await this.container.db.connection.query(sql);
			time = stopwatch.toString();
			type = new Type(result);
			success = true;
		} catch (error) {
			time = stopwatch.toString();
			type = new Type(error);
			result = error;
			success = false;
		}

		stopwatch.stop();

		return {
			success,
			type: type!,
			time: this.formatTime(time),
			result: JSON.stringify(result, null, 2)
		};
	}

	private formatTime(syncTime: string, asyncTime?: string) {
		return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
	}
}
