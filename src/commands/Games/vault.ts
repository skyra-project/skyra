import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, Settings } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserSettings } from '../../lib/types/settings/UserSettings';
import { getColor } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['bank'],
			description: language => language.tget('COMMAND_VAULT_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_VAULT_EXTENDED'),
			subcommands: true,
			usage: '<deposit|withdraw|show:default> (coins:coins)',
			usageDelim: ' '
		});

		this.createCustomResolver('coins', (arg, possible, message, [action]) => {
			if (action === 'show') return undefined;

			const coins = Number(arg);
			if (coins && coins >= 0) return this.integerArgument.run(arg, possible, message);
			throw message.language.tget('COMMAND_VAULT_INVALID_COINS');
		});
	}

	private get integerArgument() {
		return this.client.arguments.get('integer')!;
	}

	public async deposit(message: KlasaMessage, [coins]: [number]) {
		const { money, vault, settings } = await this.getVaultAndMoney(message);

		if (coins !== undefined && money < coins) {
			throw message.language.tget('COMMAND_VAULT_NOT_ENOUGH_MONEY', money);
		}

		const newMoney = money - coins;
		const newVault = vault + coins;

		await this.updateBalance(newMoney, newVault, settings);

		return message.sendEmbed(this.buildEmbed(message, newMoney, newVault, coins, true));
	}

	public async withdraw(message: KlasaMessage, [coins]: [number]) {
		const { money, vault, settings } = await this.getVaultAndMoney(message);

		if (coins !== undefined && vault < coins) {
			throw message.language.tget('COMMAND_VAULT_NOT_ENOUGH_IN_VAULT', vault);
		}

		const newMoney = money + coins;
		const newVault = vault - coins;

		await this.updateBalance(newMoney, newVault, settings);

		return message.sendEmbed(this.buildEmbed(message, newMoney, newVault, coins));
	}

	public async show(message: KlasaMessage) {
		const { money, vault } = await this.getVaultAndMoney(message);

		return message.sendEmbed(this.buildEmbed(message, money, vault));
	}

	private async getVaultAndMoney(message: KlasaMessage) {
		const { settings } = message.author;

		await settings.sync();

		const money = settings.get(UserSettings.Money);
		const vault = settings.get(UserSettings.Vault);

		return { money, vault, settings };
	}

	private updateBalance(money: number, vault: number, settings: Settings) {
		return settings.update([[UserSettings.Money, money], [UserSettings.Vault, vault]]);
	}

	private buildEmbed(message: KlasaMessage, money: number, vault: number, coins?: number, hasDeposited = false) {
		const {
			ACCOUNT_MONEY, ACCOUNT_VAULT,
			DEPOSITED_DESCRIPTION, WITHDREW_DESCRIPTION,
			SHOW_DESCRIPTION
		} = message.language.tget('COMMAND_VAULT_EMBED_DATA');

		const description = coins ? hasDeposited ? DEPOSITED_DESCRIPTION(coins) : WITHDREW_DESCRIPTION(coins) : SHOW_DESCRIPTION;

		return new MessageEmbed()
			.setColor(getColor(message))
			.setDescription(description)
			.addField(ACCOUNT_MONEY, money, true)
			.addField(ACCOUNT_VAULT, vault, true);
	}

}
