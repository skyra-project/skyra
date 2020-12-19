import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage, Piece, Stopwatch, Store } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['r'],
	description: (language) => language.get(LanguageKeys.Commands.System.ReloadDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.System.ReloadExtended),
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner,
	usage: '<Store:store|Piece:piece|everything:default>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [piece]: [Piece | 'everything']) {
		if (piece === 'everything') return this.everything(message);
		if (piece instanceof Store) {
			const timer = new Stopwatch();
			await piece.loadAll();
			await piece.init();
			if (this.client.shard) {
				await this.client.shard.broadcastEval(`
					if (String(this.options.shards) !== '${this.client.options.shards}') this.${piece.name}.loadAll().then(() => this.${piece.name}.init());
				`);
			}
			return message.sendLocale(LanguageKeys.Commands.System.ReloadAll, [{ type: piece, time: timer.stop() }]);
		}

		try {
			const itm = await piece.reload();
			const timer = new Stopwatch();
			if (this.client.shard) {
				await this.client.shard.broadcastEval(`
					if (String(this.options.shards) !== '${this.client.options.shards}') this.${piece.store}.get('${piece.name}').reload();
				`);
			}
			return message.sendLocale(LanguageKeys.Commands.System.Reload, [{ type: itm.type, name: itm.name, time: timer.stop() }]);
		} catch (err) {
			piece.store.set(piece);
			return message.sendLocale(LanguageKeys.Commands.System.ReloadFailed, [{ type: piece.type, name: piece.name }]);
		}
	}

	private async everything(message: KlasaMessage) {
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
		return message.sendLocale(LanguageKeys.Commands.System.ReloadEverything, [{ time: timer.stop() }]);
	}
}
