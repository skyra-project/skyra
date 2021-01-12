import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { access } from 'fs/promises';
import { KlasaMessage, Stopwatch, Store } from 'klasa';
import { join } from 'path';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['l'],
	description: LanguageKeys.Commands.System.LoadDescription,
	extendedHelp: LanguageKeys.Commands.System.LoadExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner,
	usage: '[core] <Store:store> <path:...string>',
	usageDelim: ' '
})
export default class extends SkyraCommand {
	private regExp = /\\\\?|\//g;

	public async run(message: KlasaMessage, [core, store, path]: ['core', Store<any, any>, string]) {
		const t = await message.fetchT();
		const splitPath = (path.endsWith('.js') ? path : `${path}.js`).split(this.regExp);
		const timer = new Stopwatch();
		const piece = await (core ? this.tryEach(store, splitPath) : store.load(store.userDirectory, splitPath));

		try {
			if (!piece) throw t(LanguageKeys.Commands.System.LoadFail);
			await piece.init();
			if (this.client.shard) {
				await this.client.shard.broadcastEval(`
					if (String(this.options.shards) !== '${this.client.options.shards}') {
						const piece = this.${piece.store}.load('${piece.directory}', ${JSON.stringify(splitPath)});
						if (piece) piece.init();
					}
				`);
			}
			return message.send(t(LanguageKeys.Commands.System.Load, { time: timer.stop().toString(), type: store.name, name: piece.name }));
		} catch (error) {
			timer.stop();
			throw t(LanguageKeys.Commands.System.LoadError, {
				type: store.name,
				name: piece ? piece.name : splitPath.join('/'),
				error
			});
		}
	}

	private async tryEach(store: Store<any, any>, path: string[]) {
		for (const dir of store.coreDirectories) if (await this.pathExists(join(dir, ...path))) return store.load(dir, path);
		return undefined;
	}

	/**
	 * Checks if a path exists.
	 * @function pathExists
	 * @memberof fsn/nextra
	 * @param path The path to check
	 */
	private async pathExists(path: string): Promise<boolean> {
		try {
			await access(path);
			return true;
		} catch (err) {
			return false;
		}
	}
}
