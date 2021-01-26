import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.System.DisableDescription,
	extendedHelp: LanguageKeys.Commands.System.DisableExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const piece = await args.pick('piece');

		if (piece.store.name === 'event' && piece.name === 'CoreMessage') {
			this.error(LanguageKeys.Commands.System.DisableWarn);
		}

		piece.enabled = false;
		return message.send(args.t(LanguageKeys.Commands.System.Disable, { type: piece.store.name, name: piece.name }), { code: 'diff' });
	}
}
