import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import type { GuildMessage } from '#lib/types';
import { Schedules } from '#lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import type { TextChannel } from 'discord.js';

const YEAR = 1000 * 60 * 60 * 24 * 365;

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['giveawayschedule', 'gs', 'gc', 'gschedule'],
	description: LanguageKeys.Commands.Giveaway.GiveawayScheduleDescription,
	extendedHelp: LanguageKeys.Commands.Giveaway.GiveawayScheduleExtended,
	requiredPermissions: ['EMBED_LINKS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
	runIn: ['text'],
	usage: '[channel:textchannelname{2}] <schedule:time> <duration:time> <title:...string{,256}>',
	flagSupport: true,
	usageDelim: ' ',
	promptLimit: Infinity
})
export default class extends SkyraCommand {
	public async run(
		message: GuildMessage,
		[channel = message.channel as TextChannel, schedule, duration, title]: [TextChannel, Date, Date, string]
	) {
		// First do the checks for the giveaway itself
		const scheduleOffset = schedule.getTime() - Date.now();
		const durationOffset = duration.getTime() - Date.now();

		if (durationOffset < 9500 || scheduleOffset < 9500) throw await message.resolveKey(LanguageKeys.Giveaway.Time);
		if (durationOffset > YEAR || scheduleOffset > YEAR) throw await message.resolveKey(LanguageKeys.Giveaway.TimeTooLong);

		// Resolve the amount of winners the giveaway will have
		let winners = Number(message.flagArgs.winners) ? parseInt(message.flagArgs.winners, 10) : 1;
		if (winners > 25) winners = 25;
		// This creates an single time task to start the giveaway
		await this.client.schedules.add(Schedules.DelayedGiveawayCreate, schedule.getTime(), {
			data: {
				title,
				endsAt: duration.getTime() + scheduleOffset + 500,
				guildID: message.guild.id,
				channelID: channel.id,
				minimum: 1,
				minimumWinners: winners
			},
			catchUp: true
		});

		return message.sendTranslated(LanguageKeys.Giveaway.Scheduled, [{ scheduledTime: scheduleOffset }]);
	}
}
