import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { codeBlock } from '@sapphire/utilities';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.System.EnableDescription,
	extendedHelp: LanguageKeys.Commands.System.EnableExtended,
	permissionLevel: PermissionLevels.BotOwner
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const piece = await args.pick('piece');
		piece.enabled = true;

		const content = codeBlock('diff', args.t(LanguageKeys.Commands.System.Enable, { type: piece.store.name, name: piece.name }));
		return send(message, content);
	}
}
