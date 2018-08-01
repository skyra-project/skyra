const { Command, constants: { TIME } } = require('../../index');
const GRACE_PERIOD = TIME.HOUR;
const DAILY_PERIOD = TIME.HOUR * 12;

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['dailies'],
			cooldown: 30,
			description: (language) => language.get('COMMAND_DAILY_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_DAILY_EXTENDED')
		});
		this.spam = true;
	}

	async run(msg) {
		const now = Date.now();
		await msg.author.configs.waitSync();
		const time = msg.author.configs.timeDaily;

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

	async claimDaily(msg, nextTime) {
		let money = 200;
		if (msg.guild) {
			await msg.guild.configs.waitSync();
			money *= msg.guild.configs.social.boost;
		}
		await msg.author.configs.update(['money', 'timeDaily'], [msg.author.configs.money + money, nextTime]);
		return money;
	}

};
