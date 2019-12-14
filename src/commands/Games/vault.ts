import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
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
			usage: '<deposit|withdraw> (coins:number)',
			usageDelim: ' '
		});
	}

	public async deposit(message: KlasaMessage, [coins]: [number]) {
		const { settings } = message.author;

		await settings.sync();

		const money = settings.get(UserSettings.Money);
		const vault = settings.get(UserSettings.Vault);

		if (money < coins) {
			throw message.language.tget('COMMAND_VAULT_NOT_ENOUGH_MONEY', money);
		}

		const newMoney = money - coins;
		const newVault = vault + coins;

		await settings.update(UserSettings.Money, newMoney);
		await settings.update(UserSettings.Vault, newVault);

		return message.sendEmbed(this.buildEmbed(message, coins, newMoney, newVault, true));
	}

	public async withdraw(message: KlasaMessage, [coins]: [number]) {
		const { settings } = message.author;

		await settings.sync();

		const money = settings.get(UserSettings.Money);
		const vault = settings.get(UserSettings.Vault);

		if (vault < coins) {
			throw message.language.tget('COMMAND_VAULT_NOT_ENOUGH_IN_VAULT', vault);
		}

		const newMoney = money + coins;
		const newVault = vault - coins;

		await settings.update(UserSettings.Money, newMoney);
		await settings.update(UserSettings.Vault, newVault);

		return message.sendEmbed(this.buildEmbed(message, coins, newMoney, newVault, false));
	}

	private buildEmbed(message: KlasaMessage, coins: number, money: number, vault: number, hasDeposited: boolean) {
		const embedData = message.language.tget('COMMAND_VAULT_EMBED_DATA');
		return new MessageEmbed()
			.setColor(getColor(message))
			.setDescription(hasDeposited ? embedData.DEPOSITED_DESCRIPTION(coins) : embedData.WITHDREW_DESCRIPTION(coins))
			.addField(embedData.ACCOUNT_MONEY, money, true)
			.addField(embedData.ACCOUNT_VAULT, vault, true);
	}

}
