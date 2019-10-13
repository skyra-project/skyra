import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { ClientSettings } from '../../lib/types/settings/ClientSettings';
import { UserSettings } from '../../lib/types/settings/UserSettings';
import { TIME } from '../../lib/util/constants';

const GRACE_PERIOD = TIME.HOUR;
const DAILY_PERIOD = TIME.HOUR * 12;

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['dailies'],
			cooldown: 30,
			description: language => language.get('COMMAND_DAILY_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_DAILY_EXTENDED'),
			spam: true
		});
	}

	public async run(message: KlasaMessage) {
		const now = Date.now();
		await message.author!.settings.sync();
		const time = message.author!.settings.get(UserSettings.TimeDaily);

		// It's been 12 hours, grant dailies
		if (time <= now) {
			return message.sendLocale('COMMAND_DAILY_TIME_SUCCESS',
				[await this.claimDaily(message, now + DAILY_PERIOD)]);
		}

		const remaining = time - now;

		// If it's not under the grace period (1 hour), tell them the time
		if (remaining > GRACE_PERIOD) return message.sendLocale('COMMAND_DAILY_TIME', [remaining]);

		// It's been 11-12 hours, ask for the user if they want to claim the grace period
		const accepted = await message.ask(message.language.get('COMMAND_DAILY_GRACE', remaining));
		if (!accepted) return message.sendLocale('COMMAND_DAILY_GRACE_DENIED');

		// The user accepted the grace period
		return message.sendLocale('COMMAND_DAILY_GRACE_ACCEPTED', [
			await this.claimDaily(message, now + remaining + DAILY_PERIOD),
			remaining + DAILY_PERIOD
		]);
	}

	public async claimDaily(message: KlasaMessage, nextTime: number) {
		let money = 200;
		if (message.guild) {
			await message.guild!.settings.sync();
			const boostGuilds = this.client.settings!.get(ClientSettings.Boosts.Guilds);
			const boostUsers = this.client.settings!.get(ClientSettings.Boosts.Users);
			money *= (boostGuilds.includes(message.guild!.id) ? 1.5 : 1) * (boostUsers.includes(message.author!.id) ? 1.5 : 1);
		}
		const total = money + message.author!.settings.get(UserSettings.Money);
		await message.author!.settings.update([['money', total], ['timeDaily', nextTime]]);
		return money;
	}

}
