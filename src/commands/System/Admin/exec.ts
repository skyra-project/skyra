import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { exec } from '#utils/Promisified/exec';
import { fetch, FetchMethods, FetchResultTypes } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { codeBlock } from '@sapphire/utilities';
import { Message, MessageAttachment } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['execute'],
	description: LanguageKeys.Commands.System.ExecDescription,
	extendedHelp: LanguageKeys.Commands.System.ExecExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner,
	usage: '<expression:string>',
	flagSupport: true
})
export default class extends SkyraCommand {
	public async run(message: Message, [input]: [string]) {
		const result = await exec(input, { timeout: Reflect.has(message.flagArgs, 'timeout') ? Number(message.flagArgs.timeout) : 60000 }).catch(
			(error) => ({
				stdout: null,
				stderr: error
			})
		);
		const output = result.stdout ? `**\`OUTPUT\`**${codeBlock('prolog', result.stdout)}` : '';
		const outerr = result.stderr ? `**\`ERROR\`**${codeBlock('prolog', result.stderr)}` : '';
		const joined = [output, outerr].join('\n') || 'No output';

		return message.send(
			joined.length > 2000 ? await this.getHaste(joined).catch(() => new MessageAttachment(Buffer.from(joined), 'output.txt')) : joined
		);
	}

	private async getHaste(result: string) {
		const { key } = (await fetch(`https://hastebin.skyra.pw/documents`, { method: FetchMethods.Post, body: result }, FetchResultTypes.JSON)) as {
			key: string;
		};
		return `https://hastebin.skyra.pw/${key}.js`;
	}
}
