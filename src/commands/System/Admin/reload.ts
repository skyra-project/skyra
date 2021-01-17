import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { Stopwatch } from '@sapphire/stopwatch';
import { ApplyOptions, CreateResolver } from '@skyra/decorators';
import type { Message } from 'discord.js';
import i18next, { TFunction } from 'i18next';
import { Piece, Store } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['r'],
	description: LanguageKeys.Commands.System.ReloadDescription,
	extendedHelp: LanguageKeys.Commands.System.ReloadExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner,
	usage: '<Store:store|Piece:piece|language:language|everything:default>'
})
@CreateResolver('language', (arg, _, message) => {
	if (message.client.i18n.languages.has(arg)) return arg;
	return 'everything';
})
export default class extends SkyraCommand {
	public async run(message: Message, [piece]: [Piece | Store<string, any> | string | 'everything']) {
		const t = await message.fetchT();

		if (piece === 'everything') return this.everything(message, t);
		if (typeof piece === 'string') return this.language(message, t, piece);
		if (piece instanceof Store) {
			const timer = new Stopwatch();
			await piece.loadAll();
			await piece.init();

			return message.send(t(LanguageKeys.Commands.System.ReloadAll, { type: piece.name, time: timer.stop().toString() }));
		}

		try {
			const itm = await piece.reload();
			const timer = new Stopwatch();

			return message.send(t(LanguageKeys.Commands.System.Reload, { type: itm.type, name: itm.name, time: timer.stop().toString() }));
		} catch (err) {
			piece.store.set(piece);
			return message.send(t(LanguageKeys.Commands.System.ReloadFailed, { type: piece.type, name: piece.name }));
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
			...this.client.pieceStores.map(async (store) => {
				await store.loadAll();
				await store.init();
			})
		]);

		return message.send(t(LanguageKeys.Commands.System.ReloadEverything, { time: timer.stop().toString() }));
	}
}
