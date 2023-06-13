import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { seconds } from '#utils/common';
import { clean } from '#utils/Sanitizer/clean';
import { cast } from '#utils/util';
import { bold } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { Stopwatch } from '@sapphire/stopwatch';
import { codeBlock, isThenable } from '@sapphire/utilities';
import type { Message } from 'discord.js';
import { setTimeout as sleep } from 'node:timers/promises';
import { inspect } from 'node:util';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['ev'],
	description: LanguageKeys.Commands.System.EvalDescription,
	detailedDescription: LanguageKeys.Commands.System.EvalExtended,
	flags: ['async', 'no-timeout', 'json', 'silent', 'showHidden', 'hidden', 'sql'],
	options: ['wait', 'lang', 'language', 'depth'],
	permissionLevel: PermissionLevels.BotOwner,
	quotes: []
})
export class UserCommand extends SkyraCommand {
	private readonly kTimeout = 60000;

	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const code = await args.rest('string');

		const wait = args.getOption('wait');
		const flagTime = args.getFlags('no-timeout') ? (wait === null ? this.kTimeout : Number(wait)) : Infinity;
		const executeSql = args.getFlags('sql');
		const language = args.getOption('lang', 'language') ?? (executeSql || args.getFlags('json') ? 'json' : 'js');
		const { success, result, time } = executeSql ? await this.sql(code) : await this.timedEval(message, args, code, flagTime);

		if (args.getFlags('silent')) {
			if (!success && result && cast<Error>(result).stack) this.container.logger.fatal(cast<Error>(result).stack);
			return null;
		}

		const header = `${bold(success ? 'Output' : 'Error')}: ${time}`;
		// If the sum of the length between the header, codeblock (```\n...\n```), and result exceed 2000 characters, send as file:
		if ([...header, ...language, ...result].length + 8 > 2000) {
			const file = { attachment: Buffer.from(result, 'utf8'), name: `output.${language}` } as const;
			return send(message, { content: header, files: [file] });
		}

		// Otherwise send as a single message:
		return send(message, `${header}${codeBlock(language, result)}`);
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

		try {
			if (args.getFlags('async')) code = `(async () => {\n${code}\n})();`;

			// @ts-expect-error value is never read, this is so `msg` is possible as an alias when sending the eval.
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const msg = message;
			// eslint-disable-next-line no-eval
			result = eval(code);
			syncTime = stopwatch.toString();
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
			time: this.formatTime(syncTime, asyncTime ?? ''),
			result: clean(result as string)
		};
	}

	private async sql(sql: string) {
		const stopwatch = new Stopwatch();
		let success: boolean;
		let time: string;
		let result: unknown;

		try {
			result = await this.container.db.connection.query(sql);
			time = stopwatch.toString();
			success = true;
		} catch (error) {
			time = stopwatch.toString();
			result = error;
			success = false;
		}

		stopwatch.stop();

		return {
			success,
			time: this.formatTime(time),
			result: JSON.stringify(result, null, 2)
		};
	}

	private formatTime(syncTime: string, asyncTime?: string) {
		return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
	}
}
