import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';
import type { Piece } from 'klasa';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['u'],
	description: LanguageKeys.Commands.System.UnloadDescription,
	extendedHelp: LanguageKeys.Commands.System.UnloadExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner,
	usage: '<Piece:piece>'
})
export default class extends SkyraCommand {
	public async run(message: Message, [piece]: [Piece]) {
		if ((piece.store.name === 'event' && piece.name === 'message') || (piece.store.name === 'monitor' && piece.name === 'commandHandler')) {
			return message.sendTranslated(LanguageKeys.Commands.System.UnloadWarn);
		}

		await piece.unload();
		return message.sendTranslated(LanguageKeys.Commands.System.Unload, [{ type: piece.store.name, name: piece.name }]);
	}
}
