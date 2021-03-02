import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { EvalExtraData, handleMessage } from '#utils/Parsers/ExceededLength';
import { sleep } from '#utils/Promisified/sleep';
import { clean } from '#utils/Sanitizer/clean';
import { cast } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Stopwatch } from '@sapphire/stopwatch';
import { Type } from '@sapphire/type';
import { codeBlock, isThenable } from '@sapphire/utilities';
import type { Message } from 'discord.js';
import { inspect } from 'util';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['ev'],
	description: LanguageKeys.Commands.System.EvalDescription,
	extendedHelp: LanguageKeys.Commands.System.EvalExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner,
	strategyOptions: {
		flags: ['async', 'no-timeout', 'json', 'silent', 'log', 'showHidden', 'hidden'],
		options: ['wait', 'lang', 'language', 'output', 'output-to', 'depth']
	}
})
export class UserCommand extends SkyraCommand {
	private readonly kTimeout = 60000;

	public async run(message: Message, args: SkyraCommand.Args) {
		const code = await args.rest('string');

		const wait = args.getOption('wait');
		const flagTime = args.getFlags('no-timeout') ? (wait === null ? this.kTimeout : Number(wait)) : Infinity;
		const language = args.getOption('lang', 'language') ?? (args.getFlags('json') ? 'json' : 'js');
		const { success, result, time, type } = await this.timedEval(message, args, code, flagTime);

		if (args.getFlags('silent')) {
			if (!success && result && cast<Error>(result).stack) this.context.client.logger.fatal(cast<Error>(result).stack);
			return null;
		}

		const footer = codeBlock('ts', type);
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
				result: args.t(LanguageKeys.Commands.System.EvalTimeout, { seconds: flagTime / 1000 }),
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
		let success: boolean | undefined = undefined;
		let syncTime: string | undefined = undefined;
		let asyncTime: string | undefined = undefined;
		let result: unknown | undefined = undefined;
		let thenable = false;
		let type: Type | undefined = undefined;

		try {
			if (args.getFlags('async')) code = `(async () => {\n${code}\n})();`;

			// @ts-expect-error 6133
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
			if (!syncTime) syncTime = stopwatch.toString();
			if (thenable && !asyncTime) asyncTime = stopwatch.toString();
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
		return { success, type: type!, time: this.formatTime(syncTime, asyncTime ?? ''), result: clean(result as string) };
	}

	private formatTime(syncTime: string, asyncTime: string) {
		return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
	}
}
