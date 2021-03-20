import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { Schedules } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Identifiers } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { Permissions, TextChannel } from 'discord.js';

const kWinnersArgRegex = /^([1-9]|\d\d+)w$/i;
const options = ['winners'];

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['giveawayschedule', 'gs', 'gc', 'gschedule'],
	description: LanguageKeys.Commands.Giveaway.GiveawayScheduleDescription,
	extendedHelp: LanguageKeys.Commands.Giveaway.GiveawayScheduleExtended,
	runIn: ['text'],
	strategyOptions: { options }
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick('textChannelName').catch(() => message.channel as TextChannel);
		const missing = channel.permissionsFor(channel.guild.me!)!.missing(UserCommand.requiredPermissions);
		if (missing.length > 0) this.error(Identifiers.PreconditionPermissions, { missing });

		const schedule = await args.pick('time');
		const allowedRoles = await this.getAllowedRoles(args);
		const duration = await args.pick('time');
		let winners = await args.pick(UserCommand.winners).catch(() => parseInt(args.getOption('winners') ?? '1', 10));
		const title = await args.rest('string', { maximum: 256 });

		// First do the checks for the giveaway itself
		const scheduleOffset = schedule.getTime() - Date.now();
		const durationOffset = duration.getTime() - Date.now();

		if (durationOffset < 9500 || scheduleOffset < 9500) this.error(LanguageKeys.Giveaway.Time);
		if (durationOffset > Time.Year || scheduleOffset > Time.Year) this.error(LanguageKeys.Giveaway.TimeTooLong);
		if (winners > 25) winners = 25;

		// This creates an single time task to start the giveaway
		await this.context.schedule.add(Schedules.DelayedGiveawayCreate, schedule.getTime(), {
			data: {
				allowedRoles,
				channelID: channel.id,
				endsAt: duration.getTime() + scheduleOffset + 500,
				guildID: message.guild.id,
				minimum: 1,
				minimumWinners: winners,
				title
			},
			catchUp: true
		});

		return message.send(args.t(LanguageKeys.Giveaway.Scheduled, { scheduledTime: scheduleOffset }));
	}

	private async getAllowedRoles(args: SkyraCommand.Args): Promise<string[]> {
		try {
			const roles = await args.repeat('roleName');
			return roles.map((role) => role.id);
		} catch {
			return [];
		}
	}

	private static winners = Args.make<number>((parameter, { argument }) => {
		const match = kWinnersArgRegex.exec(parameter);
		return match ? Args.ok(Number(match[1])) : Args.error({ parameter, argument, identifier: LanguageKeys.Arguments.Winners });
	});

	private static requiredPermissions = new Permissions([
		Permissions.FLAGS.ADD_REACTIONS,
		Permissions.FLAGS.EMBED_LINKS,
		Permissions.FLAGS.READ_MESSAGE_HISTORY,
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.VIEW_CHANNEL
	]);
}
