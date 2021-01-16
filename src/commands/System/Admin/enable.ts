import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import type { Message } from 'discord.js';
import type { Piece } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	description: LanguageKeys.Commands.System.EnableDescription,
	extendedHelp: LanguageKeys.Commands.System.EnableExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner,
	usage: '<Piece:piece>'
})
export default class extends SkyraCommand {
	public async run(message: Message, [piece]: [Piece]) {
		piece.enable();
		if (this.client.shard) {
			await this.client.shard.broadcastEval(`
				if (String(this.options.shards) !== '${this.client.options.shards}') this.${piece.store}.get('${piece.name}').enable();
			`);
		}
		return message.sendTranslated(LanguageKeys.Commands.System.Enable, [{ type: piece.type, name: piece.name }], { code: 'diff' });
	}
}
