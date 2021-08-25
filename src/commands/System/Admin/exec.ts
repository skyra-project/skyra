import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { getHaste } from '#utils/APIs/Hastebin';
import { safeWrapPromise } from '#utils/common';
import { exec } from '#utils/Promisified/exec';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { codeBlock } from '@sapphire/utilities';
import type { Message, MessageOptions } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['execute'],
	description: LanguageKeys.Commands.System.ExecDescription,
	extendedHelp: LanguageKeys.Commands.System.ExecExtended,
	permissionLevel: PermissionLevels.BotOwner,
	options: ['timeout']
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const input = await args.rest('string');
		const timeout = args.getOption('timeout');

		const result = await exec(input, { timeout: timeout ? Number(timeout) : 60000 }).catch((error) => ({
			stdout: null,
			stderr: error
		}));
		const output = result.stdout ? `**\`OUTPUT\`**${codeBlock('prolog', result.stdout)}` : '';
		const outerr = result.stderr ? `**\`ERROR\`**${codeBlock('prolog', result.stderr)}` : '';
		const joined = [output, outerr].join('\n') || 'No output';

		const options = await this.getOptions(joined);
		return send(message, options);
	}

	private async getOptions(content: string): Promise<MessageOptions> {
		if (content.length <= 2000) return { content };

		const urlResult = await safeWrapPromise(getHaste(content));
		if (urlResult.success) return { content: urlResult.value };

		const attachment = Buffer.from(content);
		const name = 'output.txt';
		return { files: [{ attachment, name }] };
	}
}
