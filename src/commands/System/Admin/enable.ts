import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';
import type { Piece } from 'klasa';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.System.EnableDescription,
	extendedHelp: LanguageKeys.Commands.System.EnableExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner,
	usage: '<Piece:piece>'
})
export default class extends SkyraCommand {
	public async run(message: Message, [piece]: [Piece]) {
		piece.enabled = true;
		return message.sendTranslated(LanguageKeys.Commands.System.Enable, [{ type: piece.store.name, name: piece.name }], { code: 'diff' });
	}
}
