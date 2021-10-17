import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Piece, Store } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { Stopwatch } from '@sapphire/stopwatch';
import type { Message } from 'discord.js';
import i18next, { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['r'],
	description: LanguageKeys.Commands.System.ReloadDescription,
	detailedDescription: LanguageKeys.Commands.System.ReloadExtended,
	permissionLevel: PermissionLevels.BotOwner
})
export class UserCommand extends SkyraCommand {
	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const content = await this.reloadAny(args);
		return send(message, content);
	}

	private async reloadAny(args: SkyraCommand.Args) {
		const everything = await args.pickResult(UserCommand.everything);
		if (everything.success) return this.reloadEverything(args.t);

		const language = await args.pickResult('language');
		if (language.success) return this.reloadLanguage(args.t, language.value);

		const store = await args.pickResult('store');
		if (store.success) return this.reloadStore(args.t, store.value);

		const piece = await args.pick('piece');
		return this.reloadPiece(args.t, piece);
	}

	private async reloadPiece(t: TFunction, piece: Piece): Promise<string> {
		const timer = new Stopwatch();
		await piece.reload();
		const type = piece.store.name.slice(0, -1);

		return t(LanguageKeys.Commands.System.Reload, { type, name: piece.name, time: timer.stop().toString() });
	}

	private async reloadStore(t: TFunction, store: Store<Piece>): Promise<string> {
		const timer = new Stopwatch();
		await store.loadAll();

		return t(LanguageKeys.Commands.System.ReloadAll, { type: store.name, time: timer.stop().toString() });
	}

	private async reloadLanguage(t: TFunction, language: string): Promise<string> {
		const timer = new Stopwatch();
		await i18next.reloadResources(language);

		return t(LanguageKeys.Commands.System.ReloadLanguage, { time: timer.stop().toString(), language });
	}

	private async reloadEverything(t: TFunction): Promise<string> {
		const timer = new Stopwatch();

		await Promise.all([
			i18next.reloadResources([...this.container.i18n.languages.keys()]),
			...[...this.container.client.stores.values()].map(async (store) => {
				await store.loadAll();
			})
		]);

		return t(LanguageKeys.Commands.System.ReloadEverything, { time: timer.stop().toString() });
	}

	private static everything = Args.make((parameter, { argument }) => {
		if (parameter.toLowerCase() === 'everything') return Args.ok('everything');
		return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.System.ReloadInvalidEverything });
	});
}
