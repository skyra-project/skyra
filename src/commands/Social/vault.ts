import { DbSet, UserEntity } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ArgumentTypes } from '@sapphire/utilities';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage, Language } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['bank'],
	description: (language) => language.get(LanguageKeys.Commands.Social.VaultDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Social.VaultExtended),
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
			throw await message.fetchLocale(LanguageKeys.Commands.Social.VaultInvalidCoins);
		}
	]
])
export default class Vault extends SkyraCommand {
	public async deposit(message: KlasaMessage, [coins]: [number]) {
		const { users } = await DbSet.connect();
		const language = await message.fetchLanguage();
		const { money, vault } = await users.lock([message.author.id], async (id) => {
			const settings = await users.ensureProfile(id);

			const { money } = settings;
			const { vault } = settings.profile;

			if (coins !== undefined && money < coins) {
				throw language.get(LanguageKeys.Commands.Social.VaultNotEnoughMoney, { money });
			}

			const newMoney = money - coins;
			const newVault = vault + coins;

			await this.updateBalance(newMoney, newVault, settings);
			return { money: newMoney, vault: newVault };
		});

		return message.sendEmbed(await this.buildEmbed(message, language, money, vault, coins, true));
	}

	public async dep(...args: ArgumentTypes<Vault['deposit']>) {
		return this.deposit(...args);
	}

	public async withdraw(message: KlasaMessage, [coins]: [number]) {
		const { users } = await DbSet.connect();
		const language = await message.fetchLanguage();
		const { money, vault } = await users.lock([message.author.id], async (id) => {
			const settings = await users.ensureProfile(id);

			const { money } = settings;
			const { vault } = settings.profile;

			if (coins !== undefined && vault < coins) {
				throw language.get(LanguageKeys.Commands.Social.VaultNotEnoughInVault, { vault });
			}

			const newMoney = money + coins;
			const newVault = vault - coins;

			await this.updateBalance(newMoney, newVault, settings);
			return { money: newMoney, vault: newVault };
		});

		return message.sendEmbed(await this.buildEmbed(message, language, money, vault, coins));
	}

	public async with(...args: ArgumentTypes<Vault['withdraw']>) {
		return this.withdraw(...args);
	}

	public async show(message: KlasaMessage) {
		const { users } = await DbSet.connect();
		const language = await message.fetchLanguage();
		const settings = await users.ensureProfile(message.author.id);
		return message.sendEmbed(await this.buildEmbed(message, language, settings.money, settings.profile.vault));
	}

	private updateBalance(money: number, vault: number, settings: UserEntity) {
		settings.money = money;
		settings.profile!.vault = vault;
		return settings.save();
	}

	private async buildEmbed(message: KlasaMessage, language: Language, money: number, vault: number, coins?: number, hasDeposited = false) {
		const { accountMoney, accountVault, depositedDescription, withdrewDescription, showDescription } = language.get(
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
