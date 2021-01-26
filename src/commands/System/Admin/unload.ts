import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['u'],
	description: LanguageKeys.Commands.System.UnloadDescription,
	extendedHelp: LanguageKeys.Commands.System.UnloadExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const piece = await args.pick('piece');

		// TODO: We do not have monitors anymore. This needs to be changed to properly whitelist pieces
		if ((piece.store.name === 'event' && piece.name === 'message') || (piece.store.name === 'monitor' && piece.name === 'commandHandler')) {
			return message.send(args.t(LanguageKeys.Commands.System.UnloadWarn));
		}

		await piece.unload();
		return message.send(args.t(LanguageKeys.Commands.System.Unload, { type: piece.store.name, name: piece.name }));
	}
}
