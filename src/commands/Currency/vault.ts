import type { UserEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { formatNumber } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { send } from '@skyra/editable-commands';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

type All = 'all' | 'max' | 'maximum';
const kAll: readonly All[] = ['all', 'max', 'maximum'];

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['bank'],
	description: LanguageKeys.Commands.Social.VaultDescription,
	extendedHelp: LanguageKeys.Commands.Social.VaultExtended,
	requiredClientPermissions: ['EMBED_LINKS'],
	subCommands: ['deposit', { input: 'dep', output: 'deposit' }, 'withdraw', { input: 'with', output: 'withdraw' }, { input: 'show', default: true }]
})
export class UserCommand extends SkyraCommand {
	public async deposit(message: Message, args: SkyraCommand.Args) {
		const all = await args.pick(UserCommand.all).catch(() => null);
		let coins = all === null ? await args.pick('integer', { minimum: 1 }) : null;

		const { users } = this.container.db;
		const { money, vault } = await users.lock([message.author.id], async (id) => {
			const settings = await users.ensureProfile(id);

			const { money } = settings;
			const { vault } = settings.profile;

			coins ??= money;
			if (money < coins) {
				this.error(LanguageKeys.Commands.Social.VaultNotEnoughMoney, { money });
			}

			const newMoney = money - coins;
			const newVault = vault + coins;

			await this.updateBalance(newMoney, newVault, settings);
			return { money: newMoney, vault: newVault };
		});

		const embed = await this.buildEmbed(message, args.t, money, vault, coins!, true);
		return send(message, { embeds: [embed] });
	}

	public async withdraw(message: Message, args: SkyraCommand.Args) {
		const all = await args.pick(UserCommand.all).catch(() => null);
		let coins = all === null ? await args.pick('integer', { minimum: 1 }) : null;

		const { users } = this.container.db;
		const { money, vault } = await users.lock([message.author.id], async (id) => {
			const settings = await users.ensureProfile(id);

			const { money } = settings;
			const { vault } = settings.profile;

			coins ??= vault;
			if (vault < coins) {
				this.error(LanguageKeys.Commands.Social.VaultNotEnoughInVault, { vault });
			}

			const newMoney = money + coins;
			const newVault = vault - coins;

			await this.updateBalance(newMoney, newVault, settings);
			return { money: newMoney, vault: newVault };
		});

		const embed = await this.buildEmbed(message, args.t, money, vault, coins!);
		return send(message, { embeds: [embed] });
	}

	public async show(message: Message, args: SkyraCommand.Args) {
		const { users } = this.container.db;
		const settings = await users.ensureProfile(message.author.id);

		const embed = await this.buildEmbed(message, args.t, settings.money, settings.profile.vault);
		return send(message, { embeds: [embed] });
	}

	private updateBalance(money: number, vault: number, settings: UserEntity) {
		settings.money = money;
		settings.profile!.vault = vault;
		return settings.save();
	}

	private async buildEmbed(message: Message, t: TFunction, money: number, vault: number, coins?: number, hasDeposited = false) {
		const { accountMoney, accountVault, depositedDescription, withdrewDescription, showDescription } = t(
			LanguageKeys.Commands.Social.VaultEmbedData,
			{ coins }
		);

		const description = coins ? (hasDeposited ? depositedDescription : withdrewDescription) : showDescription;

		return new MessageEmbed()
			.setColor(await this.container.db.fetchColor(message))
			.setDescription(description)
			.addField(accountMoney, formatNumber(t, money), true)
			.addField(accountVault, formatNumber(t, vault), true);
	}

	private static all = Args.make<boolean>((parameter, { argument }) => {
		if (kAll.includes(parameter.toLowerCase() as All)) return Args.ok(true);
		return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.Social.VaultInvalidAll, context: { possibles: kAll } });
	});
}
