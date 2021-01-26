import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Stopwatch } from '@sapphire/stopwatch';
import type { Message } from 'discord.js';
import i18next, { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['r'],
	description: LanguageKeys.Commands.System.ReloadDescription,
	extendedHelp: LanguageKeys.Commands.System.ReloadExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const { t } = args;

		const everything = await args.pickResult(UserCommand.everything);
		if (everything.success) return this.everything(message, t);

		const language = await args.pickResult('language');
		if (language.success) return this.language(message, t, language.value);

		const store = await args.pickResult('store');
		if (store.success) {
			const timer = new Stopwatch();
			await store.value.loadAll();

			return message.send(t(LanguageKeys.Commands.System.ReloadAll, { type: store.value.name, time: timer.stop().toString() }));
		}

		const piece = await args.pick('piece');
		await piece.reload();
		const timer = new Stopwatch();

		return message.send(t(LanguageKeys.Commands.System.Reload, { type: piece.store.name, name: piece.name, time: timer.stop().toString() }));
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
			...[...this.context.client.stores.values()].map(async (store) => {
				await store.loadAll();
			})
		]);

		return message.send(t(LanguageKeys.Commands.System.ReloadEverything, { time: timer.stop().toString() }));
	}

	private static everything = Args.make((parameter, { argument }) => {
		if (parameter.toLowerCase() === 'everything') return Args.ok('everything');
		// TODO: (sapphire migration) i18n identifier
		return Args.error({ parameter, argument, identifier: 'TODO' });
	});
}
