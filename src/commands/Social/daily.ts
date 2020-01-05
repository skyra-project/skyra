import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { ClientSettings } from '@lib/types/settings/ClientSettings';
import { UserSettings } from '@lib/types/settings/UserSettings';
import { Time } from '@utils/constants';
import { CommandStore, KlasaMessage } from 'klasa';
import { EconomyTransactionReason } from '@lib/types/influxSchema/Economy';

const GRACE_PERIOD = Time.Hour;
const DAILY_PERIOD = Time.Hour * 12;

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['dailies'],
			cooldown: 30,
			description: language => language.tget('COMMAND_DAILY_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_DAILY_EXTENDED'),
			spam: true
		});
	}

	public async run(message: KlasaMessage) {
		const now = Date.now();
		await message.author.settings.sync();
		const time = message.author.settings.get(UserSettings.TimeDaily);

		// It's been 12 hours, grant dailies
		if (time <= now) {
			return message.sendLocale('COMMAND_DAILY_TIME_SUCCESS',
				[await this.claimDaily(message, now + DAILY_PERIOD)]);
		}

		const remaining = time - now;

		// If it's not under the grace period (1 hour), tell them the time
		if (remaining > GRACE_PERIOD) return message.sendLocale('COMMAND_DAILY_TIME', [remaining]);

		// It's been 11-12 hours, ask for the user if they want to claim the grace period
		const accepted = await message.ask(message.language.tget('COMMAND_DAILY_GRACE', remaining));
		if (!accepted) return message.sendLocale('COMMAND_DAILY_GRACE_DENIED');

		// The user accepted the grace period
		return message.sendLocale('COMMAND_DAILY_GRACE_ACCEPTED', [
			await this.claimDaily(message, now + remaining + DAILY_PERIOD),
			remaining + DAILY_PERIOD
		]);
	}

	private async claimDaily(message: KlasaMessage, nextTime: number) {
		const money = this.calculateDailies(message);
		await Promise.all([
			message.author.increaseBalance(money, EconomyTransactionReason.Daily),
			message.author.settings.update([[UserSettings.TimeDaily, nextTime]], {
				extraContext: { author: message.author.id }
			})
		]);
		return money;
	}

	private calculateDailies(message: KlasaMessage) {
		let money = 200;
		if (this.client.settings!.get(ClientSettings.Boosts.Users).includes(message.author.id)) money *= 1.5;
		if (message.guild && this.client.settings!.get(ClientSettings.Boosts.Guilds).includes(message.guild.id)) money *= 1.5;
		return money;
	}

}
