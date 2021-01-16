import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import type { Message } from 'discord.js';
import type { Piece } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	description: LanguageKeys.Commands.System.DisableDescription,
	extendedHelp: LanguageKeys.Commands.System.DisableExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner,
	usage: '<Piece:piece>'
})
export default class extends SkyraCommand {
	public async run(message: Message, [piece]: [Piece]) {
		if ((piece.type === 'event' && piece.name === 'coreMessage') || (piece.type === 'monitor' && piece.name === 'commandHandler')) {
			return message.sendTranslated(LanguageKeys.Commands.System.DisableWarn);
		}
		piece.disable();
		if (this.client.shard) {
			await this.client.shard.broadcastEval(`
				if (String(this.options.shards) !== '${this.client.options.shards}') this.${piece.store}.get('${piece.name}').disable();
			`);
		}
		return message.sendTranslated(LanguageKeys.Commands.System.Disable, [{ type: piece.type, name: piece.name }], {
			code: 'diff'
		});
	}
}
