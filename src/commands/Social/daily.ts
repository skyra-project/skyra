import { Command, constants : { TIME }; } from; '../../index';
const GRACE_PERIOD = TIME.HOUR;
const DAILY_PERIOD = TIME.HOUR * 12;

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['dailies'],
			cooldown: 30,
			description: (language) => language.get('COMMAND_DAILY_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_DAILY_EXTENDED')
		});
		this.spam = true;
	}

	public async run(msg) {
		const now = Date.now();
		await msg.author.settings.sync();
		const time = msg.author.settings.timeDaily;

		// It's been 12 hours, grant dailies
		if (time <= now) {
			return msg.sendLocale('COMMAND_DAILY_TIME_SUCCESS',
				[await this.claimDaily(msg, now + DAILY_PERIOD)]);
		}

		const remaining = time - now;

		// If it's not under the grace period (1 hour), tell them the time
		if (remaining > GRACE_PERIOD) return msg.sendLocale('COMMAND_DAILY_TIME', [remaining]);

		// It's been 11-12 hours, ask for the user if they want to claim the grace period
		const accepted = await msg.ask(msg.language.get('COMMAND_DAILY_GRACE', remaining));
		if (!accepted) return msg.sendLocale('COMMAND_DAILY_GRACE_DENIED');

		// The user accepted the grace period
		return msg.sendLocale('COMMAND_DAILY_GRACE_ACCEPTED', [
			await this.claimDaily(msg, now + remaining + DAILY_PERIOD),
			remaining + DAILY_PERIOD
		]);
	}

	public async claimDaily(msg, nextTime) {
		let money = 200;
		if (msg.guild) {
			await msg.guild.settings.sync();
			money *= msg.guild.settings.social.boost;
		}
		await msg.author.settings.update([['money', msg.author.settings.money + money], ['timeDaily', nextTime]]);
		return money;
	}

}
