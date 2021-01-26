import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';
import type { Piece } from 'klasa';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.System.DisableDescription,
	extendedHelp: LanguageKeys.Commands.System.DisableExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner,
	usage: '<Piece:piece>'
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, [piece]: [Piece]) {
		if ((piece.store.name === 'event' && piece.name === 'coreMessage') || (piece.store.name === 'monitor' && piece.name === 'commandHandler')) {
			return message.sendTranslated(LanguageKeys.Commands.System.DisableWarn);
		}
		piece.enabled = false;
		return message.sendTranslated(LanguageKeys.Commands.System.Disable, [{ type: piece.store.name, name: piece.name }], {
			code: 'diff'
		});
	}
}
