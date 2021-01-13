import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { Message } from 'discord.js';
import { TFunction } from 'i18next';
import { Piece, Stopwatch, Store } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['r'],
	description: LanguageKeys.Commands.System.ReloadDescription,
	extendedHelp: LanguageKeys.Commands.System.ReloadExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner,
	usage: '<Store:store|Piece:piece|everything:default>'
})
export default class extends SkyraCommand {
	public async run(message: Message, [piece]: [Piece | Store<string, any> | 'everything']) {
		const t = await message.fetchT();

		if (piece === 'everything') return this.everything(message, t);
		if (piece instanceof Store) {
			const timer = new Stopwatch();
			await piece.loadAll();
			await piece.init();
			if (this.client.shard) {
				await this.client.shard.broadcastEval(`
					if (String(this.options.shards) !== '${this.client.options.shards}') this.${piece.name}.loadAll().then(() => this.${piece.name}.init());
				`);
			}
			return message.send(t(LanguageKeys.Commands.System.ReloadAll, { type: piece.name, time: timer.stop().toString() }));
		}

		try {
			const itm = await piece.reload();
			const timer = new Stopwatch();
			if (this.client.shard) {
				await this.client.shard.broadcastEval(`
					if (String(this.options.shards) !== '${this.client.options.shards}') this.${piece.store}.get('${piece.name}').reload();
				`);
			}
			return message.send(t(LanguageKeys.Commands.System.Reload, { type: itm.type, name: itm.name, time: timer.stop().toString() }));
		} catch (err) {
			piece.store.set(piece);
			return message.send(t(LanguageKeys.Commands.System.ReloadFailed, { type: piece.type, name: piece.name }));
		}
	}

	private async everything(message: Message, t: TFunction) {
		const timer = new Stopwatch();
		await Promise.all(
			this.client.pieceStores.map(async (store) => {
				await store.loadAll();
				await store.init();
			})
		);
		if (this.client.shard) {
			await this.client.shard.broadcastEval(`
				if (String(this.options.shards) !== '${this.client.options.shards}') this.pieceStores.map(async (store) => {
					await store.loadAll();
					await store.init();
				});
			`);
		}
		return message.send(t(LanguageKeys.Commands.System.ReloadEverything, { time: timer.stop().toString() }));
	}
}
