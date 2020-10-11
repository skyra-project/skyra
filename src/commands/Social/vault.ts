import { UserEntity } from '@lib/database/entities/UserEntity';
import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['bank'],
			description: (language) => language.get(LanguageKeys.Commands.Social.VaultDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Social.VaultExtended),
			requiredPermissions: ['EMBED_LINKS'],
			subcommands: true,
			usage: '<deposit|withdraw|show:default> (coins:coins)',
			usageDelim: ' '
		});

		this.createCustomResolver('coins', async (arg, possible, message, [action]) => {
			if (action === 'show') return undefined;

			if (arg === 'all') {
				const { users } = await DbSet.connect();
				const user = await users.ensureProfile(message.author.id);
				return action === 'deposit' ? user.money : user.profile.vault;
			}
			const coins = Number(arg);
			if (coins && coins >= 0) return this.integerArgument.run(arg, possible, message);
			throw message.language.get(LanguageKeys.Commands.Social.VaultInvalidCoins);
		});
	}

	private get integerArgument() {
		return this.client.arguments.get('integer')!;
	}

	public async deposit(message: KlasaMessage, [coins]: [number]) {
		const { users } = await DbSet.connect();
		return users.lock([message.author.id], async (id) => {
			const settings = await users.ensureProfile(id);

			const { money } = settings;
			const { vault } = settings.profile;

			if (coins !== undefined && money < coins) {
				throw message.language.get(LanguageKeys.Commands.Social.VaultNotEnoughMoney, { money });
			}

			const newMoney = money - coins;
			const newVault = vault + coins;

			await this.updateBalance(newMoney, newVault, settings);

			return message.sendEmbed(await this.buildEmbed(message, newMoney, newVault, coins, true));
		});
	}

	public async withdraw(message: KlasaMessage, [coins]: [number]) {
		const { users } = await DbSet.connect();
		return users.lock([message.author.id], async (id) => {
			const settings = await users.ensureProfile(id);

			const { money } = settings;
			const { vault } = settings.profile;

			if (coins !== undefined && vault < coins) {
				throw message.language.get(LanguageKeys.Commands.Social.VaultNotEnoughInVault, { vault });
			}

			const newMoney = money + coins;
			const newVault = vault - coins;

			await this.updateBalance(newMoney, newVault, settings);
			return message.sendEmbed(await this.buildEmbed(message, newMoney, newVault, coins));
		});
	}

	public async show(message: KlasaMessage) {
		const { users } = await DbSet.connect();
		const settings = await users.ensureProfile(message.author.id);
		return message.sendEmbed(await this.buildEmbed(message, settings.money, settings.profile.vault));
	}

	private updateBalance(money: number, vault: number, settings: UserEntity) {
		settings.money = money;
		settings.profile!.vault = vault;
		return settings.save();
	}

	private async buildEmbed(message: KlasaMessage, money: number, vault: number, coins?: number, hasDeposited = false) {
		const { accountMoney, accountVault, depositedDescription, withdrewDescription, showDescription } = message.language.get(
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
