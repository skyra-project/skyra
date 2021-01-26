import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Stopwatch } from '@sapphire/stopwatch';
import { CreateResolver } from '@skyra/decorators';
import type { Message } from 'discord.js';
import i18next, { TFunction } from 'i18next';
import { Piece, Store } from 'klasa';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['r'],
	description: LanguageKeys.Commands.System.ReloadDescription,
	extendedHelp: LanguageKeys.Commands.System.ReloadExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner,
	usage: '<target:reloadable>'
})
@CreateResolver('reloadable', async (arg, _, message) => {
	if (message.client.i18n.languages.has(arg)) return arg;

	const reloadableStore = await message.client.arguments
		.get('store')!
		.run(arg, _, message)
		.catch(() => undefined);

	if (reloadableStore) return reloadableStore;

	const reloadablePiece = await message.client.arguments
		.get('piece')!
		.run(arg, _, message)
		.catch(() => undefined);

	if (reloadablePiece) return reloadablePiece;

	return 'everything';
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, [piece]: [Piece | Store<Piece> | string | 'everything']) {
		const t = await message.fetchT();

		if (piece === 'everything') return this.everything(message, t);
		if (typeof piece === 'string') return this.language(message, t, piece);
		if (piece instanceof Store) {
			const timer = new Stopwatch();
			await piece.loadAll();

			return message.send(t(LanguageKeys.Commands.System.ReloadAll, { type: piece.name, time: timer.stop().toString() }));
		}

		try {
			await piece.reload();
			const timer = new Stopwatch();

			return message.send(t(LanguageKeys.Commands.System.Reload, { type: piece.store.name, name: piece.name, time: timer.stop().toString() }));
		} catch (err) {
			return message.send(t(LanguageKeys.Commands.System.ReloadFailed, { type: piece.store.name, name: piece.name }));
		}
	}

	private async language(message: Message, t: TFunction, language: string) {
		const timer = new Stopwatch();
		await i18next.reloadResources(language);

		return message.send(t(LanguageKeys.Commands.System.ReloadLanguage, { time: timer.stop().toString(), language }));
	}

	private async everything(message: Message, t: TFunction) {
		const timer = new Stopwatch();

		await Promise.all([
			i18next.reloadResources([...message.client.i18n.languages.keys()]),
			...[...this.context.client.stores].map(async (store) => {
				await store.loadAll();
			})
		]);

		return message.send(t(LanguageKeys.Commands.System.ReloadEverything, { time: timer.stop().toString() }));
	}
}
