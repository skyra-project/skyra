import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { Schedules } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { cleanMentions } from '@utils/util';
import { TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';

const YEAR = 1000 * 60 * 60 * 24 * 365;

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['giveawayschedule', 'gs', 'gc', 'gschedule'],
	description: language => language.tget('COMMAND_GIVEAWAYSCHEDULE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_GIVEAWAYSCHEDULE_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
	runIn: ['text'],
	usage: '[channel:textchannelname{2}] <schedule:time> <duration:time> <title:...string{,256}>',
	flagSupport: true,
	usageDelim: ' ',
	promptLimit: Infinity
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage, [channel = message.channel as TextChannel, schedule, duration, title]: [TextChannel, Date, Date, string]) {
		// First do the checks for the giveaway itself
		const scheduleOffset = schedule.getTime() - Date.now();
		const durationOffset = duration.getTime() - Date.now();

		if (durationOffset < 9500 || scheduleOffset < 9500) throw message.language.tget('GIVEAWAY_TIME');
		if (durationOffset > YEAR || scheduleOffset > YEAR) throw message.language.tget('GIVEAWAY_TIME_TOO_LONG');

		// Resolve the amount of winners the giveaway will have
		const winners = Number(message.flagArgs.winners) ? parseInt(message.flagArgs.winners, 10) : 1;
		// This creates an single time task to start the giveaway
		await this.client.schedules.add(Schedules.DelayedGiveawayCreate, schedule.getTime(), {
			data: {
				title: cleanMentions(message.guild!, title),
				endsAt: duration.getTime() + scheduleOffset + 500,
				guildID: message.guild!.id,
				channelID: channel.id,
				minimum: 1,
				minimumWinners: winners
			},
			catchUp: true
		});

		return message.sendLocale('GIVEAWAY_SCHEDULED', [scheduleOffset]);
	}

}
