import { connect } from '#lib/database/database.config';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { handleMessage, QueryExtraData } from '#utils/Parsers/ExceededLength';
import { cast } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Stopwatch } from '@sapphire/stopwatch';
import { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['sql'],
	description: LanguageKeys.Commands.System.ExecDescription,
	extendedHelp: LanguageKeys.Commands.System.ExecExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner,
	strategyOptions: {
		flags: ['silent', 'log'],
		options: ['output', 'output-to']
	}
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const sql = await args.rest('string');

		const { success, result, time } = await this.sql(sql);

		if (args.getFlags('silent')) {
			if (!success && result && cast<Error>(result).stack) this.context.client.logger.fatal(cast<Error>(result).stack);
			return null;
		}

		const sendAs = args.getOption('output', 'output-to') ?? (args.getFlags('log') ? 'log' : null);

		return handleMessage<Partial<QueryExtraData>>(message, {
			sendAs,
			hastebinUnavailable: false,
			url: null,
			canLogToConsole: false,
			success,
			result,
			time,
			language: 'json'
		});
	}

	private async sql(sql: string) {
		const stopwatch = new Stopwatch();
		let success: boolean | undefined = undefined;
		let time: string | undefined = undefined;
		let result: unknown | undefined = undefined;

		try {
			const connection = await connect();

			result = await connection.query(sql);
			time = stopwatch.toString();
			success = true;
		} catch (error) {
			if (!time) time = stopwatch.toString();
			result = error;
			success = false;
		}

		stopwatch.stop();

		return {
			success,
			time: `⏱ ${time}`,
			result: JSON.stringify(result, null, 2)
		};
	}
}
