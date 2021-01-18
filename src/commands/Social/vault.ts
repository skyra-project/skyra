import { DbSet, UserEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import type { ArgumentTypes } from '@sapphire/utilities';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['bank'],
	description: LanguageKeys.Commands.Social.VaultDescription,
	extendedHelp: LanguageKeys.Commands.Social.VaultExtended,
	requiredPermissions: ['EMBED_LINKS'],
	subcommands: true,
	usage: '<deposit|dep|withdraw|with|show:default> (coins:coins)',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'coins',
		async (arg, possible, message, [action]) => {
			if (action === 'show') return undefined;

			if (arg === 'all' || arg === 'max') {
				const { users } = await DbSet.connect();
				const user = await users.ensureProfile(message.author.id);
				return action === 'deposit' || action === 'dep' ? user.money : user.profile.vault;
			}
			const coins = Number(arg);
			if (coins && coins >= 0) return message.client.arguments.get('integer')!.run(arg, possible, message);
			throw await message.resolveKey(LanguageKeys.Commands.Social.VaultInvalidCoins);
		}
	]
])
export default class Vault extends SkyraCommand {
	public async deposit(message: Message, [coins]: [number]) {
		const { users } = await DbSet.connect();
		const t = await message.fetchT();
		const { money, vault } = await users.lock([message.author.id], async (id) => {
			const settings = await users.ensureProfile(id);

			const { money } = settings;
			const { vault } = settings.profile;

			if (coins !== undefined && money < coins) {
				throw t(LanguageKeys.Commands.Social.VaultNotEnoughMoney, { money });
			}

			const newMoney = money - coins;
			const newVault = vault + coins;

			await this.updateBalance(newMoney, newVault, settings);
			return { money: newMoney, vault: newVault };
		});

		return message.send(await this.buildEmbed(message, t, money, vault, coins, true));
	}

	public async dep(...args: ArgumentTypes<Vault['deposit']>) {
		return this.deposit(...args);
	}

	public async withdraw(message: Message, [coins]: [number]) {
		const { users } = await DbSet.connect();
		const t = await message.fetchT();
		const { money, vault } = await users.lock([message.author.id], async (id) => {
			const settings = await users.ensureProfile(id);

			const { money } = settings;
			const { vault } = settings.profile;

			if (coins !== undefined && vault < coins) {
				throw t(LanguageKeys.Commands.Social.VaultNotEnoughInVault, { vault });
			}

			const newMoney = money + coins;
			const newVault = vault - coins;

			await this.updateBalance(newMoney, newVault, settings);
			return { money: newMoney, vault: newVault };
		});

		return message.send(await this.buildEmbed(message, t, money, vault, coins));
	}

	public async with(...args: ArgumentTypes<Vault['withdraw']>) {
		return this.withdraw(...args);
	}

	public async show(message: Message) {
		const { users } = await DbSet.connect();
		const t = await message.fetchT();
		const settings = await users.ensureProfile(message.author.id);
		return message.send(await this.buildEmbed(message, t, settings.money, settings.profile.vault));
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
			.setColor(await DbSet.fetchColor(message))
			.setDescription(description)
			.addField(accountMoney, money, true)
			.addField(accountVault, vault, true);
	}
}
